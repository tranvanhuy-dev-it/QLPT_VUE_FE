export default {
  name: "AddendumPrint",
  props: {
    contract: {
      type: Object,
      required: true,
    },
    selectedAddendum: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const formatWaterBillingType = (type) => {
      switch (type) {
        case 'BY_INDEX': return 'Theo chỉ số đồng hồ (đ/m³)';
        case 'FIXED_PER_PERSON': return 'Theo đầu người (đ/người)';
        default: return type;
      }
    };

    const docTienBangChu = (soTien) => {
      if (soTien === undefined || soTien === null || isNaN(soTien)) return '';
      soTien = Math.round(soTien);
      if (soTien === 0) return 'Không';

      const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
      const donVi = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

      const docBlock = (number, showZero) => {
        let tram = Math.floor(number / 100);
        let chuc = Math.floor((number % 100) / 10);
        let donvi = number % 10;
        let result = "";

        if (tram > 0 || showZero) {
          result += chuSo[tram] + " trăm ";
        }

        if (chuc > 1) {
          result += chuSo[chuc] + " mươi ";
        } else if (chuc === 1) {
          result += "mười ";
        } else if (tram > 0 && donvi > 0) {
          result += "lẻ ";
        }

        if (donvi > 0) {
          if (donvi === 5 && chuc >= 1) {
            result += "lăm ";
          } else if (donvi === 1 && chuc > 1) {
            result += "mốt ";
          } else {
            result += chuSo[donvi] + " ";
          }
        }

        return result;
      };

      let str = "";
      let blocks = [];
      let temp = soTien;

      while (temp > 0) {
        blocks.push(temp % 1000);
        temp = Math.floor(temp / 1000);
      }

      for (let i = blocks.length - 1; i >= 0; i--) {
        let blockText = docBlock(blocks[i], i < blocks.length - 1);
        if (blockText !== "") {
          str += blockText + donVi[i] + " ";
        }
      }

      str = str.trim();
      if (str.length > 0) {
        str = str.substring(0, 1).toUpperCase() + str.substring(1);
      }
      return str;
    };

    return {
      currentDay,
      currentMonth,
      currentYear,
      formatMoney,
      formatDate,
      formatWaterBillingType,
      docTienBangChu,
    };
  },
};
