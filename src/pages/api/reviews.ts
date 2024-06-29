import Joi from "joi";
import type { NextApiRequest, NextApiResponse } from "next";

// import crypto from "node:crypto";
import type { Course, Review, Semester } from "src/@types";

// import { connectToDatabase } from "src/lib/mongodb";

type CreateReviewRequest = {
  rating: NonNullable<Review["rating"]>;
  difficulty: NonNullable<Review["difficulty"]>;
  workload: NonNullable<Review["workload"]>;
  body: Review["body"];
  courseId: Course["_id"];
  semesterId: Semester["_id"];
  username: string;
};

// const KEY = process.env.ENCRYPTION_KEY;
// const IV = "5183666c72eec9e4";

// function encrypt(data: string): string {
//   if (!KEY) throw new Error("Encryption key not found!");

//   const cipher = crypto.createCipheriv(
//     "aes-256-cbc",
//     Buffer.from(KEY, "hex"),
//     IV,
//   );
//   const encrypted = cipher.update(data, "utf8", "base64");

//   return encrypted + cipher.final("base64");
// }

// type CreateReviewSanityRequest = Omit<
//   CreateReviewRequest,
//   "courseId" | "semesterId" | "username"
// > & {
//   course: { _ref: string };
//   semester: { _ref: string };
// } & {
//   authorId: NonNullable<Review["authorId"]>;
// };

const schema = Joi.object<CreateReviewRequest>({
  semesterId: Joi.string().required().label("Semester"),
  courseId: Joi.string().required().label("Course"),
  rating: Joi.number().required().integer().min(1).max(5).label("Rating"),
  difficulty: Joi.number()
    .required()
    .integer()
    .min(1)
    .max(5)
    .required()
    .label("Difficulty"),
  workload: Joi.number().required().integer().min(1).max(100).label("Workload"),
  body: Joi.string().required().label("Body"),
  username: Joi.string().required().label("Username"),
});

type ResponseData = Record<string, never> | { errors: string[] };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "POST") {
    // Method Not Allowed, only accepting POST.
    res.status(405).json({});
    return;
  }

  const validationOptions = {
    abortEarly: false,
    errors: { wrap: { label: "" } },
  };
  const validationResult = schema.validate(req.body, validationOptions);

  if (validationResult.error) {
    // Bad Request, Schema Validation Error
    res
      .status(400)
      .json({ errors: validationResult.error.details.map((d) => d.message) });
    return;
  }

  // eslint-disable-next-line no-unused-vars
  const { username, code, courseId, semesterId, ...review } =
    validationResult.value;

  // const authorId = encrypt(username);

  // const request = {
  //   _type: "review",
  //   authorId,
  //   ...review,
  //   course: {
  //     _ref: courseId,
  //     _type: "reference",
  //   },
  //   semester: {
  //     _ref: semesterId,
  //     _type: "reference",
  //   },
  // };

  // Will throw ClientError if references are non-existent.
  // Will not catch at this time.
  // await sanityClient.create<CreateReviewSanityRequest>(request);
  res.status(201).json({});
}
