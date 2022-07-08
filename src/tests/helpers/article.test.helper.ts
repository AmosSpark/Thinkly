import mongoose from "mongoose";

import { IArticleDocument } from "../../resources/interfaces/article.interface";

const testArticle: IArticleDocument = {
  title: "test title",
  category: "internet",
  body: "not an empty body",
  photoId: "",
  author: new mongoose.Types.ObjectId(),
};

export default testArticle;
