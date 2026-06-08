# Kế hoạch điều chỉnh nghiệp vụ thanh toán, nước, hóa đơn và phụ lục hợp đồng

Tài liệu này đề xuất phương án chi tiết để thực hiện các yêu cầu thay đổi nghiệp vụ:
1. **Mốc thời gian thanh toán**: Chỉ thanh toán vào cuối tháng. Kỳ thanh toán từ ngày này tháng trước đến ngày thanh toán (ngày cuối tháng). Loại bỏ cấu hình không tính tiền phòng và các phụ phí khi lập hóa đơn.
2. **Tính tiền nước**: Rút gọn chỉ còn 2 cách tính: theo đầu người (`FIXED_PER_PERSON`) và theo chỉ số sử dụng (`BY_INDEX`). Loại bỏ cách tính theo phòng (`FIXED_PER_ROOM`).
3. **Hóa đơn**: Snapshot toàn bộ chi phí (giá phòng, giá điện, giá nước, cách tính nước, số người ở, phụ phí dịch vụ) trực tiếp vào Hóa đơn tại thời điểm tạo để tránh bị ảnh hưởng bởi các thay đổi hợp đồng trong tương lai.
4. **Phụ lục hợp đồng**: Cho phép tạo các phụ lục để điều chỉnh giá phòng, giá điện/nước, số người ở hoặc các dịch vụ khác. Khi tính tiền hóa đơn, hệ thống sẽ sử dụng thông tin của phụ lục mới nhất có hiệu lực.

---

## User Review Required

> [!IMPORTANT]
> **Loại bỏ cấu hình ẩn tiền phòng/phụ phí**: Theo yêu cầu, các tùy chọn "Không tính tiền phòng" (`excludeRoomPrice`) và "Không tính phụ phí" (`excludeExtraFees`) sẽ bị loại bỏ khỏi chức năng lập hóa đơn. Hóa đơn sẽ luôn tự động tính đủ tiền phòng và các phụ phí theo phụ lục mới nhất của hợp đồng.
> 
> **Mốc thời gian thanh toán**:
> - Khi lập hóa đơn, kỳ tính tiền luôn kết thúc vào ngày cuối tháng.
> - Kỳ tính tiền bắt đầu từ ngày cuối tháng trước (hoặc ngày bắt đầu hợp đồng nếu là hóa đơn đầu tiên).
> - Nếu kỳ tính tiền không trọn vẹn một tháng (ví dụ dọn vào giữa tháng), tiền phòng sẽ được chia tỷ lệ (prorated) theo số ngày ở thực tế: `dailyRate = contractedRoomPrice / daysInStartMonth`, `roomPrice = Math.round(dailyRate * stayedDays)`.

---

## Proposed Changes

### 1. Database & Backend Models (Java Spring Boot)

We will modify existing entities and add new ones for contract addendums.

#### [MODIFY] [WaterBillingType.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/entity/WaterBillingType.java)
- Remove `FIXED_PER_ROOM` from the enum.

#### [MODIFY] [Contract.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/entity/Contract.java)
- Remove `billingMode` and `fixedBillingDay` fields.
- Add bidirectional relationship to `ContractAddendum` to easily fetch addendums:
  ```java
  @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<ContractAddendum> addendums = new ArrayList<>();
  ```

#### [NEW] [ContractAddendum.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/entity/ContractAddendum.java)
Entity representing contract addendums to store pricing modifications over time:
```java
package com.qlpt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "contract_addendums", indexes = {
    @Index(name = "idx_addendums_contract_id", columnList = "contract_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractAddendum {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate; // Ngày hiệu lực của phụ lục

    @Column(name = "room_price", nullable = false)
    private double roomPrice;

    @Column(name = "electricity_rate", nullable = false)
    private double electricityRate;

    @Column(name = "water_rate", nullable = false)
    private double waterRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "water_billing_type", nullable = false)
    private WaterBillingType waterBillingType;

    @Column(name = "number_of_tenants", nullable = false)
    private int numberOfTenants;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "addendum", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ContractAddendumExtraFee> extraFees = new ArrayList<>();
}
```

#### [NEW] [ContractAddendumExtraFee.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/entity/ContractAddendumExtraFee.java)
Entity to store customized extra fee pricing for each addendum:
```java
package com.qlpt.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "contract_addendum_extra_fees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractAddendumExtraFee {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "addendum_id", nullable = false)
    private ContractAddendum addendum;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "extra_fee_id", nullable = false)
    private ExtraFee extraFee;

    @Column(name = "custom_price", nullable = false)
    private double customPrice;
}
```

#### [MODIFY] [Invoice.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/entity/Invoice.java)
Add snapshot fields to ensure invoice remains unchanged if contract or water configuration updates:
```java
    @Enumerated(EnumType.STRING)
    @Column(name = "water_billing_type", nullable = false)
    private WaterBillingType waterBillingType; // Snapshot cách tính tiền nước lúc lập

    @Column(name = "number_of_tenants", nullable = false)
    private int numberOfTenants; // Snapshot số người lúc lập

    @Column(name = "contracted_room_price", nullable = false)
    private double contractedRoomPrice; // Snapshot đơn giá phòng gốc lúc lập
```

---

### 2. DTOs and Data Transfer

We need to align request/response payloads to match the updated fields.

#### [NEW] [ContractAddendumCreateRequest.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/dto/ContractAddendumCreateRequest.java)
DTO for creating new addendums.

#### [NEW] [ContractAddendumResponse.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/dto/ContractAddendumResponse.java)
DTO to return addendum information.

#### [MODIFY] [ContractCreateRequest.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/dto/ContractCreateRequest.java)
- Remove `billingMode` and `fixedBillingDay`.

#### [MODIFY] [ContractResponse.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/dto/ContractResponse.java)
- Remove `billingMode` and `fixedBillingDay`.
- Map current pricing values from the latest addendum.

#### [MODIFY] [InvoiceCreateRequest.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/dto/InvoiceCreateRequest.java)
- Remove `excludeRoomPrice` and `excludeExtraFees`.

#### [MODIFY] [InvoiceResponse.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/dto/InvoiceResponse.java)
- Add new snapshot fields (`waterBillingType`, `numberOfTenants`, `contractedRoomPrice`).

---

### 3. Business Logic (Java Spring Boot Services & Controllers)

#### [NEW] [ContractAddendumRepository.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/repository/ContractAddendumRepository.java)
```java
package com.qlpt.backend.repository;

import com.qlpt.backend.entity.ContractAddendum;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContractAddendumRepository extends JpaRepository<ContractAddendum, UUID> {
    List<ContractAddendum> findByContractIdOrderByStartDateDesc(UUID contractId);
    
    // Tìm phụ lục mới nhất có hiệu lực trước hoặc bằng một thời điểm
    Optional<ContractAddendum> findFirstByContractIdAndStartDateLessThanEqualOrderByStartDateDesc(UUID contractId, LocalDate date);
}
```

#### [NEW] [ContractAddendumExtraFeeRepository.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/repository/ContractAddendumExtraFeeRepository.java)
Repository for `ContractAddendumExtraFee`.

#### [MODIFY] [ContractService.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/service/ContractService.java)
- In `createContract`, remove `billingMode` and `fixedBillingDay` settings.
- Automatically save the contract's original values as the **first / initial addendum** (`startDate = contract.getStartDate()`, description = "Phụ lục gốc"). This makes all contracts consistent.
- In `getContractExtraFees`, if a latest addendum exists, fetch the extra fees associated with that addendum instead of the original contract extra fees.

#### [NEW] [ContractAddendumService.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/service/ContractAddendumService.java)
Service to manage adding and retrieving contract addendums.

#### [NEW] [ContractAddendumController.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/controller/ContractAddendumController.java)
API endpoints:
- `POST /api/contracts/{contractId}/addendums` to add an addendum.
- `GET /api/contracts/{contractId}/addendums` to list all addendums.

#### [MODIFY] [InvoiceService.java](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_JAVA_BE/src/main/java/com/qlpt/backend/service/InvoiceService.java)
- Update invoice generation logic to query the latest active addendum for the contract as of the `billingPeriodEnd` date.
- Retrieve all pricing values from that addendum (room price, electricity rate, water rate, water billing type, number of tenants, and extra fees).
- Calculate the room price:
  - Determine if the billing cycle is a full month (start is the end of the previous month/1st of this month, and end is the end of the current month). If yes, charge full price. If no, prorate.
- Save the snapshot values (`waterBillingType`, `numberOfTenants`, `contractedRoomPrice`) into the `Invoice` entity.

---

### 4. Frontend Views (Vue JS)

#### [MODIFY] [BoardingHouses.vue](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_VUE_FE/src/views/landlord/BoardingHouses.vue) & [BoardingHouses.js](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_VUE_FE/src/views/landlord/BoardingHouses.js)
- Remove `billingTiming` dropdown.
- Remove `FIXED_PER_ROOM` option from "Cách tính tiền nước" select.

#### [MODIFY] [Contracts.vue](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_VUE_FE/src/views/landlord/Contracts.vue) & [Contracts.js](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_VUE_FE/src/views/landlord/Contracts.js)
- Remove `billingMode` and `fixedBillingDay` input controls.

#### [MODIFY] [ContractDetail.vue](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_VUE_FE/src/views/landlord/ContractDetail.vue) & [ContractDetail.js](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_VUE_FE/src/views/landlord/ContractDetail.js)
- Remove billing mode/day display in Summary tab.
- Add a new "Lịch sử phụ lục hợp đồng" (Contract Addendums List) section showing all addendums.
- Add "Thêm phụ lục hợp đồng" button and modal. The modal allows setting effective date, room price, electricity/water prices, water billing type, number of tenants, and customizing services/extra fees.
- Update contract printing layout to use the values from the latest addendum.

#### [MODIFY] [Invoices.vue](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_VUE_FE/src/views/landlord/Invoices.vue) & [Invoices.js](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_VUE_FE/src/views/landlord/Invoices.js)
- Remove `excludeRoomPrice` and `excludeExtraFees` checkbox settings from modal, computed previews, and submit payload.
- Simplify billing cycle generation: default start date to end of previous invoice, end date to the end of the current month.

#### [MODIFY] [InvoiceDetail.vue](file:///e:/PROJECT/PERSONAL%20PROJECT/Quan%20ly%20phong%20tro/QLPT_VUE_FE/src/views/landlord/InvoiceDetail.vue)
- Update invoice details and print preview sheet to render values from the `Invoice` entity's snapshotted fields (`waterBillingType`, `numberOfTenants`, `contractedRoomPrice`) instead of retrieving them dynamically from the `Contract` object.

---

## Verification Plan

### Automated Tests
- Run `mvn test` in the Java project backend.
- Update `InvoiceServiceTest.java` to test:
  1. Billing calculation using the latest active addendum.
  2. Prorated room price when the billing cycle is partial.
  3. Water index calculation and fixed per person calculation.

### Manual Verification
- Deploy backend and frontend dev server.
- Test Creating a Boarding House without billingTiming.
- Test Creating a Contract. Verify that it automatically creates the first addendum in DB.
- Test Adding a new Addendum with altered prices (e.g. room price changed from 3M to 3.5M).
- Test Creating an Invoice for the room. Check that it uses the 3.5M room price from the addendum.
- Test modifying contract info (e.g. changing contract price to 4M) and check that the old invoice's detail view still prints/displays the 3.5M price.
