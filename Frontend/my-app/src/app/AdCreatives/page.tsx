import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";
import ClientAdsList from "@/components/adcreative/ClientAdsList";

export const metadata: Metadata = {
  title: "Ad Creatives | Ad Pilot",
};

const AdCreativesPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Ad Creatives"
        description="View all your created ads and their performance"
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <ClientAdsList />
        </div>
      </section>
    </>
  );
};

export default AdCreativesPage;
