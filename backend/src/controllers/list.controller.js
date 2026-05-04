const List = require('../models/List')
const { success, error } = require('../utils/response')

// UC17: Lấy lists theo board
const getLists = async (req, res, next) => {
  try {
    const lists = await List.find({ board: req.query.boardId }).sort('position')
    return success(res, lists)
  } catch (err) { next(err) }
}

// UC17: Tạo list (cột)
const createList = async (req, res, next) => {
  try {
    const list = await List.create(req.body)
    return success(res, list, 'Tạo cột thành công', 201)
  } catch (err) { next(err) }
}

// UC17: Đổi tên list
const updateList = async (req, res, next) => {
  try {
    const list = await List.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!list) return error(res, 'Không tìm thấy cột', 404)
    return success(res, list, 'Cập nhật cột thành công')
  } catch (err) { next(err) }
}

// UC17: Xoá list
const deleteList = async (req, res, next) => {
  try {
    await List.findByIdAndDelete(req.params.id)
    return success(res, {}, 'Xoá cột thành công')
  } catch (err) { next(err) }
}

module.exports = { getLists, createList, updateList, deleteList }
