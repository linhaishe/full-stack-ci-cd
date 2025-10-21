/* eslint-disable react/prop-types */
import { useState } from 'react';
import { ALL_BOOKS, ALL_GENRES, BOOK_ADDED } from '../queries';
import { useQuery } from '@apollo/client';
import { useSubscription } from '@apollo/client';

// function that takes care of manipulating cache
const updateCache = (cache, query, bookAdded) => {
  // helper that is used to eliminate saving same book twice
  const uniqById = (arr) => {
    const seen = new Set();
    return arr.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqById(allBooks.concat(bookAdded)),
    };
  });
};

const Books = (props) => {
  const [searchGenres, setSearchGenres] = useState(null);
  const { data: allBooks, refetch } = useQuery(ALL_BOOKS);
  const { data: allGenres } = useQuery(ALL_GENRES);

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      window.alert('new book!');
      const bookAdded = data?.data?.bookAdded;
      console.log('收到数据:', data);
      updateCache(client.cache, { query: ALL_BOOKS }, bookAdded);
      // client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
      //   return {
      //     allBooks: allBooks.concat(bookAdded),
      //   };
      // });
    },
    onError: (err) => console.error('订阅出错', err),
  });

  if (!props.show) {
    return null;
  }

  const books = allBooks?.allBooks;
  const genresList = allGenres?.allGenres;
  const onFilter = (genre) => {
    refetch({ genre });
  };

  return (
    <div>
      <h2>books</h2>
      <p>
        {'in Genre: '}
        <span
          style={{
            fontWeight: '900',
          }}
        >
          {searchGenres || ' '}
        </span>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books?.map((a) => (
            <tr key={a?.title}>
              <td>{a?.title}</td>
              <td>{a?.author?.name}</td>
              <td>{a?.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genresList?.map((v, index) => {
        return (
          <button
            key={index}
            onClick={() => {
              setSearchGenres(v);
              onFilter(v);
            }}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
};

export default Books;
