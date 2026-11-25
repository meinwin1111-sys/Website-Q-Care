const serviceModel = require("../models/serviceModel");
const {
  mapServiceRow,
  mapPriceBreakdownRow,
  mapStepRow,
  mapCategoryRow,
} = require("../utils/mappers");
const { mapSqlError } = require("../utils/sqlErrors");

async function listServices(req, res) {
  try {
    const rows = await serviceModel.findAllActive();
    const services = rows.map((row) => mapServiceRow(row, { priceBreakdown: [], steps: [] }));
    return res.json(services);
  } catch (err) {
    console.error("listServices error:", err);
    return res.status(500).json({ message: "Không thể tải danh sách dịch vụ." });
  }
}

async function getServiceById(req, res) {
  try {
    const serviceId = Number(req.params.id);
    if (Number.isNaN(serviceId)) {
      return res.status(400).json({ message: "ID dịch vụ không hợp lệ." });
    }

    const row = await serviceModel.findById(serviceId);
    if (!row) {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ." });
    }

    const [breakdownRows, stepRows] = await Promise.all([
      serviceModel.findPriceBreakdown(serviceId),
      serviceModel.findSteps(serviceId),
    ]);

    const service = mapServiceRow(row, {
      priceBreakdown: breakdownRows.map(mapPriceBreakdownRow),
      steps: stepRows.map(mapStepRow),
    });
    return res.json(service);
  } catch (err) {
    console.error("getServiceById error:", err);
    return res.status(500).json({ message: "Không thể tải chi tiết dịch vụ." });
  }
}

async function listCategories(req, res) {
  try {
    const rows = await serviceModel.findAllCategories();
    return res.json(rows.map(mapCategoryRow));
  } catch (err) {
    console.error("listCategories error:", err);
    return res.status(500).json({ message: "Không thể tải danh mục." });
  }
}

function parseServiceBody(body) {
  const price = Number(body.price);
  return {
    categoryCode: body.category,
    title: body.title?.trim(),
    subtitle: body.subtitle?.trim() ?? (body.description ? body.description.slice(0, 60) : ""),
    price: Number.isNaN(price) ? NaN : price,
    duration: body.duration?.trim() ?? "",
    image: body.image?.trim() ?? "",
    description: body.description?.trim() ?? "",
    priceBreakdown: body.priceBreakdown,
    steps: body.steps,
  };
}

async function createService(req, res) {
  try {
    const data = parseServiceBody(req.body);
    if (!data.title) {
      return res.status(400).json({ message: "Vui lòng nhập tên dịch vụ." });
    }
    if (Number.isNaN(data.price) || data.price < 0) {
      return res.status(400).json({ message: "Giá tiền không hợp lệ." });
    }
    if (!data.categoryCode) {
      return res.status(400).json({ message: "Vui lòng chọn danh mục." });
    }

    const categoryId = await serviceModel.getCategoryIdByCode(data.categoryCode);
    if (!categoryId) {
      return res.status(400).json({ message: "Danh mục không tồn tại." });
    }

    const defaultBreakdown = [{ label: data.title, price: data.price }];
    const serviceId = await serviceModel.createService({
      categoryId,
      title: data.title,
      subtitle: data.subtitle,
      price: data.price,
      duration: data.duration || "30–60 phút",
      image: data.image || null,
      description: data.description,
      priceBreakdown: data.priceBreakdown ?? defaultBreakdown,
      steps: data.steps ?? [],
    });

    req.params.id = String(serviceId);
    return getServiceById(req, res);
  } catch (err) {
    console.error("createService error:", err);
    const mapped = mapSqlError(err);
    return res.status(mapped.status).json({ message: mapped.message });
  }
}

async function updateService(req, res) {
  try {
    const serviceId = Number(req.params.id);
    if (Number.isNaN(serviceId)) {
      return res.status(400).json({ message: "ID dịch vụ không hợp lệ." });
    }

    const exists = await serviceModel.serviceExists(serviceId);
    if (!exists) {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ." });
    }

    const data = parseServiceBody(req.body);
    if (!data.title) {
      return res.status(400).json({ message: "Vui lòng nhập tên dịch vụ." });
    }
    if (Number.isNaN(data.price) || data.price < 0) {
      return res.status(400).json({ message: "Giá tiền không hợp lệ." });
    }

    const categoryId = await serviceModel.getCategoryIdByCode(data.categoryCode);
    if (!categoryId) {
      return res.status(400).json({ message: "Danh mục không tồn tại." });
    }

    await serviceModel.updateService(serviceId, {
      categoryId,
      title: data.title,
      subtitle: data.subtitle,
      price: data.price,
      duration: data.duration,
      image: data.image || null,
      description: data.description,
      priceBreakdown: data.priceBreakdown,
      steps: data.steps,
    });

    req.params.id = String(serviceId);
    return getServiceById(req, res);
  } catch (err) {
    console.error("updateService error:", err);
    const mapped = mapSqlError(err);
    return res.status(mapped.status).json({ message: mapped.message });
  }
}

async function deleteService(req, res) {
  try {
    const serviceId = Number(req.params.id);
    if (Number.isNaN(serviceId)) {
      return res.status(400).json({ message: "ID dịch vụ không hợp lệ." });
    }

    const exists = await serviceModel.serviceExists(serviceId);
    if (!exists) {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ." });
    }

    const hasLinkedAppointments = await serviceModel.hasLinkedAppointments(serviceId);
    if (hasLinkedAppointments) {
      return res.status(409).json({
        message: "Không thể xóa dịch vụ vì đang có lịch hẹn liên kết. Hãy hủy các lịch hẹn trước khi xóa dịch vụ.",
      });
    }

    await serviceModel.softDeleteService(serviceId);
    return res.status(204).send();
  } catch (err) {
    console.error("deleteService error:", err);
    return res.status(500).json({ message: "Không thể xóa dịch vụ." });
  }
}

module.exports = {
  listServices,
  getServiceById,
  listCategories,
  createService,
  updateService,
  deleteService,
};
