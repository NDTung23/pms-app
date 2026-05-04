const Board = require('../models/Board')
const { success, error } = require('../utils/response')

// UC17: Lấy boards theo project
const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ project: req.query.projectId })
    return success(res, boards)
  } catch (err) { next(err) }
}

// UC17: Tạo board
const createBoard = async (req, res, next) => {
  try {
    const board = await Board.create(req.body)
    return success(res, board, 'Tạo board thành công', 201)
  } catch (err) { next(err) }
}

// UC17: Xoá board
const deleteBoard = async (req, res, next) => {
  try {
    await Board.findByIdAndDelete(req.params.id)
    return success(res, {}, 'Xoá board thành công')
  } catch (err) { next(err) }
}

module.exports = { getBoards, createBoard, deleteBoard }
