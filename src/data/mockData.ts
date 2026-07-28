import type {
  AdminAppt,
  Appointment,
  CategoryOption,
  PetOption,
  Service,
  StatusMeta,
} from "../types";

export const MINT = "#A3E4D7";
export const CHARCOAL = "#2C2C2C";
export const SLATE = "#7A7A7A";
export const VET_NAME = "Nguyễn Văn Quang";
export const TODAY = "2026-07-22";

export const SERVICES: Service[] = [
  { id:1, category:"spa", title:"Tắm Spa Premium", subtitle:"Tắm, sấy và massage thư giãn", price:250000, duration:"60–90 phút",
    image:"https://images.unsplash.com/photo-1611173622933-91942d394b04?w=900&h=520&fit=crop&auto=format",
    description:"Dịch vụ tắm spa cao cấp dành cho thú cưng, sử dụng sản phẩm organic an toàn kết hợp massage thư giãn và sấy tạo kiểu chuyên nghiệp.",
    priceBreakdown:[{label:"Tắm & sấy cơ bản",price:150000},{label:"Massage thư giãn",price:70000},{label:"Nước hoa thú cưng",price:30000}],
    steps:[{step:1,title:"Kiểm tra sức khỏe ban đầu",desc:"Kiểm tra da, lông và tình trạng sức khỏe tổng quát"},{step:2,title:"Tắm với sản phẩm organic",desc:"Shampoo và conditioner chuyên dụng theo loại lông"},{step:3,title:"Massage thư giãn",desc:"Massage toàn thân nhẹ nhàng, kích thích tuần hoàn"},{step:4,title:"Sấy & tạo kiểu",desc:"Sấy khô hoàn toàn, chải và tạo kiểu lông"},{step:5,title:"Hoàn thiện & kiểm tra",desc:"Kiểm tra lại và xịt nước hoa nhẹ nhàng"}] },
  { id:2, category:"trimming", title:"Cắt Tỉa Lông", subtitle:"Tạo kiểu và cắt tỉa chuyên nghiệp", price:180000, duration:"45–60 phút",
    image:"https://images.unsplash.com/photo-1581887936036-3f4f7f0b6679?w=900&h=520&fit=crop&auto=format",
    description:"Cắt tỉa lông theo yêu cầu với nhiều kiểu dáng đa dạng phù hợp từng giống loài. Thợ tạo kiểu được huấn luyện chuyên sâu.",
    priceBreakdown:[{label:"Cắt lông cơ bản",price:120000},{label:"Tạo kiểu nâng cao",price:40000},{label:"Chải & dưỡng lông",price:20000}],
    steps:[{step:1,title:"Tư vấn kiểu dáng",desc:"Trao đổi và chọn kiểu phù hợp với giống loài"},{step:2,title:"Chải rối và làm mềm lông",desc:"Gỡ rối, làm mềm lông trước khi cắt"},{step:3,title:"Cắt tỉa chính xác",desc:"Cắt theo kiểu đã chọn với kéo chuyên dụng"},{step:4,title:"Hoàn thiện chi tiết",desc:"Tỉa vùng nhỏ: tai, chân, quanh mắt, đuôi"}] },
  { id:3, category:"hygiene", title:"Vệ Sinh Tai & Móng", subtitle:"Làm sạch tai và cắt móng an toàn", price:120000, duration:"20–30 phút",
    image:"https://images.unsplash.com/photo-1597595735781-6a57fb8e3e3d?w=900&h=520&fit=crop&auto=format",
    description:"Vệ sinh tai và cắt móng định kỳ giúp phòng ngừa viêm nhiễm, giữ thú cưng luôn khỏe mạnh và thoải mái.",
    priceBreakdown:[{label:"Vệ sinh tai",price:60000},{label:"Cắt móng",price:50000},{label:"Dũa & làm mịn móng",price:10000}],
    steps:[{step:1,title:"Kiểm tra tai",desc:"Phát hiện sớm viêm nhiễm, nấm hoặc ký sinh"},{step:2,title:"Làm sạch tai",desc:"Dùng dung dịch chuyên dụng, làm sạch nhẹ nhàng"},{step:3,title:"Cắt móng đúng kỹ thuật",desc:"Cắt tránh phần mạch máu, không gây đau"},{step:4,title:"Dũa & hoàn thiện",desc:"Dũa nhẵn móng để tránh trầy xước đồ vật"}] },
  { id:4, category:"health", title:"Khám Sức Khỏe Tại Nhà", subtitle:"Bác sĩ thú y đến tận nơi kiểm tra", price:350000, duration:"45–60 phút",
    image:"https://images.unsplash.com/photo-1668979323445-11d84f1be907?w=900&h=520&fit=crop&auto=format",
    description:"Bác sĩ thú y có chứng chỉ hành nghề đến tận nhà khám toàn diện, giúp thú cưng không bị stress. Bao gồm tư vấn dinh dưỡng và kê đơn.",
    priceBreakdown:[{label:"Khám tổng quát",price:200000},{label:"Phí di chuyển",price:50000},{label:"Tư vấn dinh dưỡng",price:100000}],
    steps:[{step:1,title:"Xác nhận & chuẩn bị",desc:"Bác sĩ xác nhận thời gian và chuẩn bị dụng cụ"},{step:2,title:"Khám tổng quát toàn thân",desc:"Kiểm tra tim, phổi, da, lông, mắt, tai, bụng"},{step:3,title:"Chẩn đoán & tư vấn",desc:"Phân tích kết quả và tư vấn phác đồ chăm sóc"},{step:4,title:"Kê đơn & hướng dẫn",desc:"Kê đơn thuốc và hướng dẫn chăm sóc tại nhà"}] },
  { id:5, category:"spa", title:"Tắm & Thơm Toàn Thân", subtitle:"Tắm sạch kết hợp nước hoa cao cấp", price:160000, duration:"30–45 phút",
    image:"https://images.unsplash.com/photo-1597603413826-cd1c06b05222?w=900&h=520&fit=crop&auto=format",
    description:"Tắm sạch chuyên nghiệp kết hợp nước hoa thú cưng cao cấp, an toàn và dịu nhẹ với da.",
    priceBreakdown:[{label:"Tắm & sấy",price:120000},{label:"Nước hoa premium",price:40000}],
    steps:[{step:1,title:"Ướt lông và làm mềm",desc:"Làm ướt đều và thoa conditioner dưỡng lông"},{step:2,title:"Tắm sạch kỹ càng",desc:"Shampoo phù hợp loại lông, massage da đầu"},{step:3,title:"Sấy khô hoàn toàn",desc:"Sấy khô, chải mượt và tạo phồng lông"},{step:4,title:"Xịt thơm cao cấp",desc:"Nước hoa riêng cho thú cưng, an toàn, thơm lâu"}] },
  { id:6, category:"health", title:"Tiêm Vaccine Định Kỳ", subtitle:"Tiêm phòng đầy đủ tại nhà bởi bác sĩ", price:220000, duration:"15–20 phút",
    image:"https://images.unsplash.com/photo-1668979323481-e5d03e2bdbb2?w=900&h=520&fit=crop&auto=format",
    description:"Dịch vụ tiêm vaccine định kỳ tại nhà. Vaccine nhập khẩu chính hãng, bảo quản đúng chuẩn lạnh.",
    priceBreakdown:[{label:"Vaccine phòng bệnh dại",price:100000},{label:"Vaccine đa giá (5 bệnh)",price:90000},{label:"Phí tiêm & di chuyển",price:30000}],
    steps:[{step:1,title:"Kiểm tra sức khỏe trước tiêm",desc:"Đảm bảo thú cưng đủ điều kiện sức khỏe"},{step:2,title:"Tư vấn loại vaccine phù hợp",desc:"Lựa chọn vaccine theo độ tuổi và lịch sử tiêm"},{step:3,title:"Thực hiện tiêm chủng",desc:"Tiêm đúng kỹ thuật, giảm thiểu khó chịu"},{step:4,title:"Theo dõi phản ứng sau tiêm",desc:"Quan sát 15–20 phút, xử lý ngay nếu có dị ứng"},{step:5,title:"Cấp sổ tiêm chủng",desc:"Ghi nhận và lên lịch tiêm cho lần tiếp theo"}] },
  { id:7, category:"health", title:"Tẩy Giun & Ký Sinh Trùng", subtitle:"Xử lý giun sán và ve rận toàn thân", price:180000, duration:"20–30 phút",
    image:"https://images.unsplash.com/photo-1521391553259-3fd6729dafad?w=900&h=520&fit=crop&auto=format",
    description:"Phác đồ tẩy giun và diệt ký sinh trùng ngoài da toàn diện, sử dụng thuốc thú y nhập khẩu an toàn.",
    priceBreakdown:[{label:"Thuốc tẩy giun nội ký sinh",price:80000},{label:"Thuốc xịt ve, bọ chét",price:70000},{label:"Phí khám & di chuyển",price:30000}],
    steps:[{step:1,title:"Kiểm tra mức độ nhiễm ký sinh",desc:"Quan sát lông, da và kiểm tra phân cơ bản"},{step:2,title:"Chọn phác đồ điều trị",desc:"Lựa chọn thuốc phù hợp theo cân nặng và loài"},{step:3,title:"Tẩy giun nội ký sinh",desc:"Cho uống hoặc nhỏ gáy thuốc tẩy giun"},{step:4,title:"Xịt diệt ngoại ký sinh",desc:"Xịt toàn thân, đặc biệt vùng tai, bẹn, đuôi"},{step:5,title:"Tư vấn phòng ngừa tái nhiễm",desc:"Hướng dẫn vệ sinh môi trường sống cho thú"}] },
  { id:8, category:"health", title:"Siêu Âm & Xét Nghiệm", subtitle:"Chẩn đoán hình ảnh và xét nghiệm máu", price:450000, duration:"30–45 phút",
    image:"https://images.unsplash.com/photo-1668979323481-e5d03e2bdbb2?w=900&h=520&fit=crop&auto=format",
    description:"Siêu âm ổ bụng và xét nghiệm máu cơ bản tại nhà với thiết bị di động chuyên dụng.",
    priceBreakdown:[{label:"Siêu âm ổ bụng",price:200000},{label:"Xét nghiệm máu tổng quát",price:180000},{label:"Phí di chuyển & thiết bị",price:70000}],
    steps:[{step:1,title:"Chuẩn bị & nhịn ăn",desc:"Hướng dẫn chuẩn bị trước siêu âm (nhịn 4–6h)"},{step:2,title:"Lấy mẫu máu xét nghiệm",desc:"Lấy máu tĩnh mạch nhanh, ít đau"},{step:3,title:"Thực hiện siêu âm",desc:"Siêu âm gan, thận, bàng quang, tử cung/tinh hoàn"},{step:4,title:"Đọc kết quả & chẩn đoán",desc:"Phân tích hình ảnh và chỉ số máu ngay tại chỗ"},{step:5,title:"Tư vấn phác đồ điều trị",desc:"Đưa ra hướng điều trị hoặc theo dõi định kỳ"}] },
  { id:9, category:"health", title:"Chăm Sóc Sau Phẫu Thuật", subtitle:"Theo dõi và thay băng hậu phẫu tại nhà", price:280000, duration:"30–40 phút",
    image:"https://images.unsplash.com/photo-1675430426271-d74b542f21e4?w=900&h=520&fit=crop&auto=format",
    description:"Chăm sóc chuyên biệt sau phẫu thuật tại nhà, bao gồm thay băng vô trùng và theo dõi hồi phục.",
    priceBreakdown:[{label:"Thay băng & sát trùng vết mổ",price:120000},{label:"Kiểm tra và theo dõi hồi phục",price:100000},{label:"Phí di chuyển",price:60000}],
    steps:[{step:1,title:"Đánh giá tình trạng vết thương",desc:"Kiểm tra nhiễm trùng, sưng tấy, chảy dịch"},{step:2,title:"Tháo băng cũ và làm sạch",desc:"Rửa vết mổ bằng nước muối sinh lý"},{step:3,title:"Sát trùng và bôi thuốc",desc:"Sát trùng và bôi thuốc kháng sinh tại chỗ"},{step:4,title:"Băng bó lại vô trùng",desc:"Băng lại bằng vật liệu vô khuẩn chuyên dụng"},{step:5,title:"Báo cáo tiến trình hồi phục",desc:"Ghi nhận và tư vấn lịch tái khám tiếp theo"}] },
];

export const CATEGORIES: CategoryOption[] = [
  { id:"all", label:"Tất cả" },
  { id:"spa", label:"Tắm & Spa" },
  { id:"trimming", label:"Cắt Tỉa Lông" },
  { id:"hygiene", label:"Vệ Sinh" },
  { id:"health", label:"Sức Khỏe" },
];

export const PET_OPTIONS: PetOption[] = [
  { value:"dog", label:"Chó", emoji:"🐶" },
  { value:"cat", label:"Mèo", emoji:"🐱" },
  { value:"bird", label:"Chim", emoji:"🐦" },
  { value:"hamster", label:"Chuột Hamster", emoji:"🐹" },
  { value:"rabbit", label:"Thỏ", emoji:"🐰" },
  { value:"other", label:"Khác...", emoji:"🐾" },
];

export const PET_BG: Record<string, string> = {
  dog:"#FFF3E0", cat:"#F3E5F5", bird:"#E3F2FD",
  hamster:"#FFF8E1", rabbit:"#F9FBE7", other:"#F5F5F5",
};

export const TIME_SLOTS = [
  { label:"Sáng", times:["07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00"] },
  { label:"Chiều", times:["13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"] },
  { label:"Tối", times:["17:00","17:30","18:00","18:30","19:00","19:30","20:00"] },
];

export const VI_MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
export const VI_DAYS = ["CN","T2","T3","T4","T5","T6","T7"];

export const STATUS_MAP: Record<string, StatusMeta> = {
  success: { label:"Đặt lịch thành công", bg:"#E8F8F5", color:"#0D6E5A" },
  cancelled: { label:"Đã hủy", bg:"#FFEBEE", color:"#C62828" },
};

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id:"QC-2B4F8A", service:"Tắm Spa Premium",        pet:"Milo", petType:"dog",  petDisplay:"Chó", petEmoji:"🐶", date:"2026-07-12", time:"09:00", status:"success",   price:250000, address:"45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng", vet:`Bác sĩ: ${VET_NAME}` },
  { id:"QC-7C9D1E", service:"Khám Sức Khỏe Tại Nhà", pet:"Luna", petType:"cat",  petDisplay:"Mèo", petEmoji:"🐱", date:"2026-07-18", time:"14:30", status:"success",   price:350000, address:"12 Lê Duẩn, Thanh Khê, Đà Nẵng",       vet:`Bác sĩ: ${VET_NAME}` },
  { id:"QC-6E8A0B", service:"Vệ Sinh Tai & Móng",     pet:"Milo", petType:"dog",  petDisplay:"Chó", petEmoji:"🐶", date:"2026-07-25", time:"08:30", status:"success",   price:120000, address:"45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng", vet:`Bác sĩ: ${VET_NAME}` },
  { id:"QC-3A5E7B", service:"Cắt Tỉa Lông",           pet:"Milo", petType:"dog",  petDisplay:"Chó", petEmoji:"🐶", date:"2026-06-28", time:"10:00", status:"success",   price:180000, address:"45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng", vet:`Bác sĩ: ${VET_NAME}` },
  { id:"QC-9F2C4D", service:"Tiêm Vaccine Định Kỳ",   pet:"Luna", petType:"cat",  petDisplay:"Mèo", petEmoji:"🐱", date:"2026-05-20", time:"16:00", status:"cancelled", price:220000, address:"12 Lê Duẩn, Thanh Khê, Đà Nẵng",       vet:`Bác sĩ: ${VET_NAME}` },
];

export const ADMIN_APPOINTMENTS: AdminAppt[] = [
  { id:"QC-2B4F8A", customer:"Nguyễn Minh Tuấn", pet:"Milo",   service:"Tắm Spa Premium",        date:"2026-07-22", time:"09:00", status:"success"   },
  { id:"QC-7C9D1E", customer:"Trần Thị Lan",     pet:"Luna",   service:"Khám Sức Khỏe Tại Nhà",  date:"2026-07-22", time:"14:30", status:"success"   },
  { id:"QC-6E8A0B", customer:"Lê Văn Hùng",      pet:"Bông",   service:"Vệ Sinh Tai & Móng",     date:"2026-07-22", time:"08:30", status:"success"   },
  { id:"QC-3A5E7B", customer:"Phạm Thị Hoa",     pet:"Rocky",  service:"Cắt Tỉa Lông",           date:"2026-07-21", time:"10:00", status:"success"   },
  { id:"QC-9F2C4D", customer:"Đỗ Văn Nam",       pet:"Kitty",  service:"Tiêm Vaccine Định Kỳ",   date:"2026-07-21", time:"16:00", status:"cancelled" },
  { id:"QC-A1B2C3", customer:"Hoàng Thị Mai",    pet:"Buddy",  service:"Tắm & Thơm Toàn Thân",   date:"2026-07-20", time:"11:00", status:"success"   },
  { id:"QC-D4E5F6", customer:"Vũ Minh Đức",      pet:"Tiger",  service:"Siêu Âm & Xét Nghiệm",   date:"2026-07-19", time:"09:30", status:"success"   },
];
