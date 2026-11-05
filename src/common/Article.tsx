import { paragraphs } from "@/common/content";

interface ArticleProps {
  title: string;
  length?: number;
}

export function Article({ title, length = 40 }: ArticleProps) {
  return (
    <article>
      <h1>{title}</h1>
      {paragraphs(length).map((text) => (
        <p key={text}>{text}</p>
      ))}
    </article>
  );
}
