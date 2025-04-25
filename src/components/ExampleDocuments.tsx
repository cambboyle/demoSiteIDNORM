import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Define example document URLs without hands
const EXAMPLE_DOCUMENTS = [
  {
    id: 1,
    title: "Driver License",
    url: "https://static.wixstatic.com/media/346a11_d0b5e1f8e204e83b0fb14d6188918a9~mv2.jpg",
  },
  {
    id: 2,
    title: "Passport",
    url: "https://static.wixstatic.com/media/346a11_9a96ed562e2346f68cb923eac2678a18~mv2.jpg",
  },
  {
    id: 3,
    title: "ID Card",
    url: "https://static.wixstatic.com/media/346a11_e4a732428d3d4be4b4f4243b7dd1bc80~mv2.jpg",
  },
  {
    id: 4,
    title: "Residence Permit",
    url: "https://static.wixstatic.com/media/346a11_14a54322e0874f5696aca06cae72aa9d~mv2.jpg",
  },
];

interface ExampleDocumentsProps {
  onSelectExample: (imageDataUrl: string) => void;
}

const ExampleDocuments = ({ onSelectExample }: ExampleDocumentsProps) => {
  const [loading, setLoading] = useState<number | null>(null);

  const downloadImage = async (imageUrl: string, id: number) => {
    try {
      setLoading(id);
      const response = await fetch(imageUrl, { method: "get" });
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        onSelectExample(base64Image);
        setLoading(null);
      };
      reader.onerror = () => {
        console.error("Error reading file");
        setLoading(null);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Failed to download image:", error);
      setLoading(null);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-idnorm-primary mb-6 text-center">
          Try with Example Documents
        </h2>
        <p className="text-center text-idnorm-lightText mb-10 max-w-2xl mx-auto">
          Click on any example document below to see how our verification system
          works with different types of IDs
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXAMPLE_DOCUMENTS.map((doc) => (
            <Card
              key={doc.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white"
              onClick={() => downloadImage(doc.url, doc.id)}
            >
              <CardContent className="p-0 relative">
                <img
                  src="/placeholder.svg"
                  alt={doc.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="text-white text-center">
                    <p className="font-medium text-lg mb-2">{doc.title}</p>
                    <span className="bg-idnorm-primary text-white px-3 py-1 rounded-full text-sm">
                      {loading === doc.id ? "Loading..." : "Use this example"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExampleDocuments;
