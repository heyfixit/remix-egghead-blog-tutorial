import { Form } from "@remix-run/react";
import { ActionFunction, redirect } from "@remix-run/server-runtime";
import { createPost } from "~/models/post.server";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const title = data.get("title");
  const slug = data.get("slug");
  const markdown = data.get("markdown");

  await createPost({ title, slug, markdown });
  return redirect("/posts/admin");
};

const inputClassName = `w-full rounded border border-gray-300 px-3 py-2 mb-3 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent`;

export default function NewPostRoute() {
  return (
    <Form method="post">
      <p>
        <label>
          Post Title:
          <input type="text" name="title" className={inputClassName} />
        </label>
      </p>
      <p>
        <label>
          Post Slug:
          <input type="text" name="slug" className={inputClassName} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>
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
