import Heading from './heading';

export default function HeadingSmall({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return <Heading title={title} description={description} variant="small" />;
}
