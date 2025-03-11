type Author = {
  name: string;
  image: string;
  designation: string;
};

export type Ad = {  
  id: number;
  title: string;
  paragraph: string;
  image: string;
  cover_imglink?: string;
  author: Author;
  tags: string[];
  publishDate: string;
  adcopy: string;
  productname: string;
  product_category: string;
  username: string;
};