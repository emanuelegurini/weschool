import Link from "next/link";

interface CardProps {
  title: string;
  description: string;
  href: string;
}

const Card: React.FC<CardProps> = ({ title, description, href }) => {
  return (
    <Link href={href} passHref>
      <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default Card;