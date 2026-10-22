import { serializeJsonLd } from "@/shared/lib/seo/metadata";

type JsonLdProps = {
    data: Record<string, unknown>;
};

const JsonLd = ({ data }: JsonLdProps) => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
);

export default JsonLd;
