import type { GetStaticProps } from "next";
import Head from "next/head";

import type { Course, Review } from "src/@types";
import { Review as ReviewComponent } from "src/components/review";

// import { sanityClient } from "src/sanity";

interface ReviewsPageProps {
  reviews: Array<
    Review & {
      course: Pick<Course, "name" | "slug" | "term">;
    }
  >;
}

export const getStaticProps: GetStaticProps<ReviewsPageProps> = async () => {
  // const query = `
  //   *[_type == 'review']{
  //     "id": _id,
  //     "created": _createdAt,
  //     ...,
  //     semester->,
  //     course-> {
  //       name,
  //       "slug": slug.current
  //     }
  //   } | order(_createdAt desc)[0...100]
  // `;

  // const reviews = await sanityClient.fetch<ReviewsPageProps["reviews"]>(query);
  const reviews: ReviewsPageProps["reviews"] = [];

  return { props: { reviews } };
};

export default function Reviews({ reviews }: ReviewsPageProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Recent Reviews | OMSCentral</title>
      </Head>
      <main className="m-auto max-w-7xl px-5 py-10">
        <h3 className="mb-10 text-center text-3xl font-medium text-gray-900">
          100 Most Recent Reviews
        </h3>
        <ul className="space-y-4 divide-gray-200">
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewComponent review={review} />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
