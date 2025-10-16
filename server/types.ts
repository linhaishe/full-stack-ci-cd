export type TAddBookParams = {
  title: string;
  author: string;
  published: number;
  genres: string[];
};

export type TAddAuthorParams = {
  name: string;
  born: number;
};

export type TEditAuthorParams = {
  name: string;
  setBornTo: number;
};
