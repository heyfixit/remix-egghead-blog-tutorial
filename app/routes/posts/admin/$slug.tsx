import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "~/models/post.server";
import { requireAdminUser } from "~/session.server";

type ActionData =
  | {
      title: string | null;
      slug: string | null;
      markdown: string | null;
    }
  | undefined;

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  if (params.slug === "new") {
    return json({});
  }

  const post = await getPost(params.slug);
  return json({ post });
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  const data = await request.formData();
  const intent = data.get("intent");

  if (intent === "delete") {
    await deletePost(params.slug);
    return redirect("/posts/admin");
  }

  const title = data.get("title");
  const slug = data.get("slug");
  const markdown = data.get("markdown");

  const errors: ActionData = {
    title: !title ? "Title is required" : null,
    slug: !slug ? "Slug is required" : null,
    markdown: !markdown ? "Markdown is required" : null,
  };

  // if any of the values were truthy we know there was at least one error
  const hasErrors = Object.values(errors).some((error) => error);
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof title === "string", "title should be a string");
  invariant(typeof slug === "string", "slug should be a string");
  invariant(typeof markdown === "string", "markdown should be a string");

  if (params.slug === "new") {
    await createPost({ title, slug, markdown });
  } else {
    await updatePost(params.slug, { slug, title, markdown });
  }
  return redirect("/posts/admin");
};

const inputClassName = `w-full rounded border border-gray-300 px-3 py-2 mb-3 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent`;

export default function NewPostRoute() {
  const data = useLoaderData();
  const errors = useActionData() as ActionData;
  const transition = useTransition();
  const isNewPost = !data.post;
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";
  return (
    <Form method="post" key={data.post?.slug ?? "new"}>
      <p>
        <label>
          Post Title:{" "}
          {errors?.title && <em className="text-red-600">{errors.title}</em>}
          <input
            type="text"
            name="title"
            className={inputClassName}
            defaultValue={data.post?.title}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug && <em className="text-red-600">{errors.slug}</em>}
          <input
            type="text"
            name="slug"
            className={inputClassName}
            defaultValue={data.post?.slug}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">
          Markdown:{" "}
          {errors?.markdown && (
            <em className="text-red-600">{errors.markdown}</em>
          )}
        </label>
        <textarea
          name="markdown"
          id="markdown"
          className={`${inputClassName} font-mono`}
          defaultValue={data.post?.markdown}
        />
      </p>
      <div className="flex justify-end gap-4">
        {isNewPost ? null : (
          <button
            type="submit"
            name="intent"
            value="delete"
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
            disabled={isDeleting}
          >
            {isDeleting ? null : isUpdating ? "Deleting..." : "Delete Post"}
          </button>
        )}
        <button
          type="submit"
          name="intent"
          value={isNewPost ? "create" : "update"}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isCreating || isUpdating}
        >
          {isNewPost ? (isCreating ? "Creating..." : "Create") : null}
          {isNewPost ? null : isUpdating ? "Updating..." : "Update"}
        </button>
      </div>
    </Form>
  );
}
