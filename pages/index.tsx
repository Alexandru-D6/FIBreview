import { Fragment, FC, useState, useEffect } from "react";

import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { Popover, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/solid";

import { Input } from "../components/Input";
import { SortIcon } from "../components/SortIcon";

import type { Course } from "../@types";
import { getCourses } from "../lib/sanity";
import { Toggle } from "../components/Toggle";

interface HomePageProps {
  courses: Course[];
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const courses = await getCourses();

  return {
    props: { courses },
  };
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface PaginationProps {
  pageSize: number;
  pageNumber: number;
  resultCount: number;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextPageSize: number) => void;
  pageSizes: number[];
}

const Pagination: FC<PaginationProps> = ({
  pageSize,
  pageNumber,
  resultCount,
  onPageChange,
  onPageSizeChange,
  pageSizes,
}) => {
  const rangeStart = pageNumber * pageSize;
  const rangeEnd = Math.min(rangeStart + pageSize, resultCount);

  const hasNextPage = rangeStart + pageSize - 1 <= resultCount;
  const hasPrevPage = pageNumber !== 0;

  function incrementPageNumber(): void {
    hasNextPage && onPageChange(pageNumber + 1);
  }
  function decrementPageNumber(): void {
    hasPrevPage && onPageChange(pageNumber - 1);
  }

  function changePageSize(nextPageSize: number): void {
    onPageSizeChange(nextPageSize);
  }

  let paginationChunks: number[][];

  const totalPages = Math.ceil(resultCount / pageSize);

  if (totalPages <= 7) {
    paginationChunks = [
      Array(totalPages)
        .fill(0)
        .map((_, i) => i),
    ];
  } else if (pageNumber <= 3) {
    paginationChunks = [[0, 1, 2, 3, 4], [totalPages - 1]];
  } else if (totalPages - pageNumber <= 4) {
    paginationChunks = [[0], [5, 4, 3, 2, 1].map((v) => totalPages - v)];
  } else {
    paginationChunks = [
      [0],
      [pageNumber - 1, pageNumber, pageNumber + 1],
      [totalPages - 1],
    ];
  }

  return (
    <div className="bg-white px-4 py-3 flex flex-wrap items-center justify-center border-t border-gray-200 sm:px-6 gap-4">
      <p className="text-sm text-gray-700 md:w-full">
        Showing <span className="font-medium">{rangeStart + 1}</span> to{" "}
        <span className="font-medium">{rangeEnd}</span> of{" "}
        <span className="font-medium">{resultCount}</span> courses
      </p>
      <div className="md:grow">
        <span className="relative z-0 inline-flex items-center rounded-md">
          {pageSizes.map((size, i, a) => {
            return (
              <button
                key={size}
                type="button"
                onClick={() => size != pageSize && changePageSize(size)}
                className={classNames(
                  i == 0
                    ? "rounded-l-md"
                    : i === a.length - 1
                    ? "-ml-px rounded-r-md"
                    : "-ml-px",
                  "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500",
                  size === pageSize
                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                    : ""
                )}
              >
                {size}
              </button>
            );
          })}
          <span className="ml-2 text-sm text-gray-700">courses per page</span>
        </span>
      </div>
      <div>
        <nav
          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          <button
            {...(hasPrevPage ? {} : { disabled: true })}
            onClick={decrementPageNumber}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          {paginationChunks.map((chunks, i, a) => {
            return chunks
              .map((page) => {
                return (
                  <button
                    key={page}
                    {...(page === pageNumber && { "aria-current": "page" })}
                    onClick={() => onPageChange(page)}
                    className={classNames(
                      page === pageNumber
                        ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                        : "",
                      "relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    )}
                  >
                    {page + 1}
                  </button>
                );
              })
              .concat(
                i + 1 === a.length
                  ? []
                  : [
                      <span
                        key="..."
                        className="relative inline-flex items-center px-4 py-2 border bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>,
                    ]
              );
          })}
          <button
            {...(hasNextPage ? {} : { disabled: true })}
            onClick={incrementPageNumber}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white"
          >
            <span className="sr-only">Next</span>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  );
};

interface SortConfig {
  attribute: keyof Pick<
    Course,
    "name" | "difficulty" | "reviewCount" | "rating" | "workload"
  >;
  direction: "desc" | "asc";
}

function getDefaultInputValue(value: number | undefined): string {
  if (typeof value === "undefined" || isNaN(value)) {
    return "";
  } else {
    return value.toString();
  }
}

const Home: NextPage<HomePageProps> = ({ courses }) => {
  const [sort, setSort] = useState<SortConfig>({
    attribute: "reviewCount",
    direction: "desc",
  });

  // By default only show courses with 1+ review
  const [minReviewCount, setMinReviewCount] = useState<number>(1);
  const [maxReviewCount, setMaxReviewCount] = useState<number>();

  const [minRating, setMinRating] = useState<number>();
  const [maxRating, setMaxRating] = useState<number>();

  const [minDifficulty, setMinDifficulty] = useState<number>();
  const [maxDifficulty, setMaxDifficulty] = useState<number>();

  const [minWorkload, setMinWorkload] = useState<number>();
  const [maxWorkload, setMaxWorkload] = useState<number>();

  const [hideDeprecated, setHideDeprecated] = useState(false);
  const [onlyShowFoundational, setOnlyShowFoundational] = useState(false);

  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(0);

  const current = courses
    .filter(
      ({
        reviewCount,
        rating,
        difficulty,
        workload,
        isDeprecated,
        isFoundational,
      }) => {
        function between(
          value: number | null,
          min: number,
          max: number
        ): boolean {
          return value === null ? true : value >= min && value <= max;
        }

        return (
          between(
            reviewCount,
            minReviewCount || 0,
            maxReviewCount || Infinity
          ) &&
          between(rating, minRating || 1, maxRating || 5) &&
          between(difficulty, minDifficulty || 1, maxDifficulty || 5) &&
          between(workload, minWorkload || 1, maxWorkload || 100) &&
          (hideDeprecated ? isDeprecated === false : true) &&
          (onlyShowFoundational ? isFoundational === true : true)
        );
      }
    )
    .sort((a, b) => {
      const ordering = sort.direction === "asc" ? 1 : -1;
      const { attribute } = sort;

      if (attribute === "name") {
        return a[attribute].localeCompare(b[attribute]) * ordering;
      } else if (a[attribute] === null) {
        return 1;
      } else if (b[attribute] === null) {
        return -1;
      } else {
        return ((a[attribute] as number) - (b[attribute] as number)) * ordering;
      }
    });

  useEffect(() => {
    if (pageSize * pageNumber >= current.length) {
      setPageNumber(Math.floor(current.length / pageSize));
    }
  }, [pageNumber, pageSize, current]);

  const slice = current.slice(
    pageNumber * pageSize,
    pageNumber * pageSize + pageSize
  );

  function toggleSort(attribute: SortConfig["attribute"]) {
    if (sort.attribute !== attribute) {
      setSort({ attribute, direction: "asc" });
    } else {
      setSort({
        attribute,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    }
  }

  return (
    <>
      <Head>
        <title>Home | OMSCentral</title>
      </Head>
      <main className="mx-auto sm:max-w-4xl sm:px-6 lg:px-8 mt-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="sm:flex sm:items-center mb-10">
                <div className="sm:flex-auto">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    OMS Reviews
                  </h1>
                  <p className="mt-2 text-sm text-gray-700">
                    Pick the best course for you this semester.
                  </p>
                  <a
                    target="_blank"
                    href="https://github.com/oms-tech/reviews"
                    className="text-indigo-600 text-xs md:text-sm hover:text-indigo-900 flex"
                    rel="noreferrer"
                  >
                    View on Github
                  </a>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center px-4 py-2 border border-dotted border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-300 hover:blur-sm hover:cursor-not-allowed"
                  >
                    Add Review
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <div>
                  <Popover className="relative">
                    {({ open }) => (
                      <>
                        <Popover.Button
                          className={`
                ${open ? "" : "text-opacity-90"}
                w-24 group inline-flex items-center rounded-md bg-indigo-700 px-3 py-2 text-base font-medium text-white hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                        >
                          <span>{open ? "Done" : "Filters"}</span>
                          <ChevronDownIcon
                            className={`${open ? "" : "text-opacity-70"}
                  ml-2 h-5 w-5 text-indigo-300 transition duration-150 ease-in-out group-hover:text-opacity-80`}
                            aria-hidden="true"
                          />
                        </Popover.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Popover.Panel className="absolute right-0 z-10 mt-3 px-4 sm:px-0">
                            <article className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                              <form className="bg-white p-7">
                                <div className="mb-6">
                                  <p className="mb-4 text-xs text-gray-500 uppercase">
                                    Filter by review count
                                  </p>
                                  <fieldset className="flex gap-2">
                                    <legend className="sr-only">
                                      Review Count
                                    </legend>
                                    <Input
                                      id="minReview"
                                      type="text"
                                      label="Min Reviews"
                                      placeholder="1"
                                      defaultValue={getDefaultInputValue(
                                        minReviewCount
                                      )}
                                      inputMode="decimal"
                                      size={10}
                                      onBlur={(e) => {
                                        console.log("blur", e);
                                        setMinReviewCount(
                                          parseFloat(e.currentTarget.value)
                                        );
                                      }}
                                    />
                                    <Input
                                      id="maxReview"
                                      type="text"
                                      label="Max Reviews"
                                      placeholder="100"
                                      size={10}
                                      defaultValue={getDefaultInputValue(
                                        maxReviewCount
                                      )}
                                      inputMode="decimal"
                                      onBlur={(e) => {
                                        setMaxReviewCount(
                                          parseFloat(e.currentTarget.value)
                                        );
                                      }}
                                    />
                                  </fieldset>
                                </div>
                                <div className="mb-6">
                                  <p className="mb-4 text-xs text-gray-500 uppercase">
                                    Filter by stats
                                  </p>
                                  <div className="flex flex-col gap-6">
                                    <fieldset className="flex gap-2">
                                      <legend className="sr-only">
                                        Rating
                                      </legend>
                                      <Input
                                        id="minRating"
                                        type="text"
                                        label="Min Rating"
                                        placeholder="1"
                                        defaultValue={getDefaultInputValue(
                                          minRating
                                        )}
                                        size={10}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMinRating(
                                            parseFloat(e.currentTarget.value)
                                          );
                                        }}
                                      />
                                      <Input
                                        id="maxRating"
                                        type="text"
                                        label="Max Rating"
                                        placeholder="5"
                                        defaultValue={getDefaultInputValue(
                                          maxRating
                                        )}
                                        size={10}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMaxRating(
                                            parseFloat(e.currentTarget.value)
                                          );
                                        }}
                                      />
                                    </fieldset>
                                    <fieldset className="flex gap-2">
                                      <legend className="sr-only">
                                        Difficulty
                                      </legend>
                                      <Input
                                        id="minDifficulty"
                                        type="text"
                                        label="Min Difficulty"
                                        placeholder="1"
                                        defaultValue={getDefaultInputValue(
                                          minDifficulty
                                        )}
                                        size={10}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMinDifficulty(
                                            parseFloat(e.currentTarget.value)
                                          );
                                        }}
                                      />
                                      <Input
                                        id="maxDifficulty"
                                        type="text"
                                        label="Max Difficulty"
                                        placeholder="5"
                                        defaultValue={getDefaultInputValue(
                                          maxDifficulty
                                        )}
                                        size={10}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMaxDifficulty(
                                            parseFloat(e.currentTarget.value)
                                          );
                                        }}
                                      />
                                    </fieldset>
                                    <fieldset className="flex gap-2">
                                      <legend className="sr-only">
                                        Workload
                                      </legend>
                                      <Input
                                        id="minWorkload"
                                        type="text"
                                        label="Min Workload"
                                        placeholder="10"
                                        defaultValue={getDefaultInputValue(
                                          minWorkload
                                        )}
                                        size={10}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMinWorkload(
                                            parseFloat(e.currentTarget.value)
                                          );
                                        }}
                                      />
                                      <Input
                                        id="maxWorkload"
                                        type="text"
                                        label="Max Workload"
                                        placeholder="20"
                                        defaultValue={getDefaultInputValue(
                                          maxWorkload
                                        )}
                                        size={10}
                                        inputMode="decimal"
                                        onBlur={(e) => {
                                          setMaxWorkload(
                                            parseFloat(e.currentTarget.value)
                                          );
                                        }}
                                      />
                                    </fieldset>
                                  </div>
                                </div>
                                <div className="mb-6">
                                  <p className="mb-4 text-xs text-gray-500 uppercase">
                                    Other Filters
                                  </p>
                                  <div className="flex flex-col gap-6">
                                    <Toggle
                                      enabled={onlyShowFoundational}
                                      onChange={setOnlyShowFoundational}
                                      label="Foundational only"
                                    />
                                    <Toggle
                                      enabled={hideDeprecated}
                                      onChange={setHideDeprecated}
                                      label="Hide deprecated"
                                    />
                                  </div>
                                </div>
                              </form>
                            </article>
                          </Popover.Panel>
                        </Transition>
                      </>
                    )}
                  </Popover>
                </div>
              </div>
              <div className="inline-block min-w-full py-4 align-middle">
                <div className="shadow-sm ring-1 ring-black ring-opacity-5">
                  <table
                    className="min-w-full border-separate"
                    style={{ borderSpacing: 0 }}
                  >
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="sticky top-0 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          <a
                            href="#"
                            className="group inline-flex"
                            onClick={() => toggleSort("name")}
                          >
                            Name
                            <SortIcon
                              active={sort.attribute === "name"}
                              direction={sort.direction}
                            ></SortIcon>
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          <a
                            href="#"
                            className="group inline-flex"
                            onClick={() => toggleSort("rating")}
                          >
                            Rating
                            <SortIcon
                              active={sort.attribute === "rating"}
                              direction={sort.direction}
                            ></SortIcon>
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          <a
                            href="#"
                            className="group inline-flex"
                            onClick={() => toggleSort("difficulty")}
                          >
                            Difficulty
                            <SortIcon
                              active={sort.attribute === "difficulty"}
                              direction={sort.direction}
                            ></SortIcon>
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          <a
                            href="#"
                            className="group inline-flex"
                            onClick={() => toggleSort("workload")}
                          >
                            Workload
                            <SortIcon
                              active={sort.attribute === "workload"}
                              direction={sort.direction}
                            ></SortIcon>
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-2 py-2 md:px-3 md:py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                        >
                          <a
                            href="#"
                            className="group inline-flex"
                            onClick={() => toggleSort("reviewCount")}
                          >
                            Reviews
                            <SortIcon
                              active={sort.attribute === "reviewCount"}
                              direction={sort.direction}
                            ></SortIcon>
                          </a>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {slice.map(
                        (
                          {
                            id,
                            name,
                            reviewCount,
                            difficulty,
                            rating,
                            workload,
                          },
                          index
                        ) => (
                          <tr
                            key={id}
                            className={
                              index % 2 === 0 ? undefined : "bg-gray-50"
                            }
                          >
                            <td className=" px-2 py-2 md:px-3 md:py-4 text-sm font-medium text-gray-500 sm:pl-6 ">
                              <span className="text-xs hidden sm:block">
                                {id}
                              </span>
                              <dl className="font-normal">
                                <dt className="sr-only">Title</dt>
                                <dd className="mt-1">
                                  <Link href={`/courses/${id}/reviews`}>
                                    <a className="text-indigo-600 text-xs md:text-sm hover:text-indigo-900">
                                      {name}
                                      <span className="sr-only"> reviews</span>
                                    </a>
                                  </Link>
                                </dd>
                              </dl>
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 md:px-3 md:py-4 text-xs sm:text-sm text-gray-500">
                              {rating ? rating.toFixed(2) : "N/A"}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 md:px-3 md:py-4 text-xs sm:text-sm text-gray-500">
                              {difficulty ? difficulty.toFixed(2) : "N/A"}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 md:px-3 md:py-4 text-xs sm:text-sm text-gray-500">
                              {workload ? workload.toFixed(2) : "N/A"}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 md:px-3 md:py-4 text-xs sm:text-sm text-gray-500">
                              {reviewCount}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  resultCount={current.length}
                  pageSize={pageSize}
                  pageNumber={pageNumber}
                  onPageChange={setPageNumber}
                  onPageSizeChange={setPageSize}
                  pageSizes={[10, 25, 50]}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
