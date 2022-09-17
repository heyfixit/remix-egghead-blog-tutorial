import { Form, useActionData } from "@remix-run/react";
import { ActionFunction, json, redirect } from "@remix-run/server-runtime";
import { createPost } from "~/models/post.server";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const title = data.get("title");
  const slug = data.get("slug");
  const markdown = data.get("markdown");

  const errors = {
    title: !title ? "Title is required" : null,
    slug: !slug ? "Slug is required" : null,
    markdown: !markdown ? "Markdown is required" : null,
  };

  // if any of the values were truthy we know there was at least one error
  const hasErrors = Object.values(errors).some((error) => error);
  if (hasErrors) {
    return json(errors);
  }

  await createPost({ title, slug, markdown });
  return redirect("/posts/admin");
};

const inputClassName = `w-full rounded border border-gray-300 px-3 py-2 mb-3 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent`;

export default function NewPostRoute() {
  const errors = useActionData();
  return (
    <Form method="post">
      <p>
        <label>
          Post Title:{" "}
          {errors?.title && <em className="text-red-600">{errors.title}</em>}
          <input type="text" name="title" className={inputClassName} />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug && <em className="text-red-600">{errors.slug}</em>}
          <input type="text" name="slug" className={inputClassName} />
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
        />
      </p>
      <p className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Create Post
        </button>
      </p>
    </Form>
  );
}
