import { Request, Response } from "express";
import { Quiz } from "../models/Quiz";
import { Question } from "../models/Question";
import handleError from "../utils/HandleError";

// GET /quizzes
export const getAllQuizzes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const quizzes = await Quiz.find().populate("questions");
    res.json(quizzes);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /quizzes/:quizId
export const getQuizById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params["quizId"]).populate(
      "questions"
    );
    quiz ? res.json(quiz) : res.status(404).json({ message: "Quiz not found" });
  } catch (error) {
    handleError(res, error);
  }
};

// POST /quizzes
export const createQuiz = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    handleError(res, error);
  }
};

// PUT /quizzes/:quizId
export const updateQuiz = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params["quizId"], req.body, {
      new: true,
    });
    quiz ? res.json(quiz) : res.status(404).json({ message: "Quiz not found" });
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE /quizzes/:quizId
export const deleteQuiz = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await Quiz.findByIdAndDelete(req.params["quizId"]);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
};

// GET /quizzes/:quizId/populate/:keyword
export const getQuizByKeyword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const keyword = req.params["keyword"];
    const regex = new RegExp(keyword || "", "i");
    const quiz = await Quiz.findById(req.params["quizId"]).populate({
      path: "questions",
      match: { keywords: { $regex: regex } },
    });
    res.json(quiz);
  } catch (error) {
    handleError(res, error);
  }
};

// POST /quizzes/:quizId/question
export const addQuestionToQuiz = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const question = new Question(req.body);
    await question.save();
    const quiz = await Quiz.findById(req.params["quizId"]);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }
    quiz.questions.push(question._id);
    await quiz.save();
    res.status(201).json(question);
  } catch (error) {
    handleError(res, error);
  }
};

// POST /quizzes/:quizId/questions
export const addQuestionsToQuiz = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const questions = req.body.map((q: any) => new Question(q));
    const newQuestions = await Question.insertMany(questions);
    const quiz = await Quiz.findById(req.params["quizId"]);
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }
    quiz.questions.push(...newQuestions.map((q) => q["_id"]));
    await quiz.save();
    res.status(201).json(newQuestions);
  } catch (error) {
    handleError(res, error);
  }
};