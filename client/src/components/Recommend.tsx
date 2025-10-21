/* eslint-disable react/prop-types */
import { useState } from 'react';
import { ALL_BOOKS, ALL_GENRES } from '../queries';
import { useQuery } from '@apollo/client';

const Recommend = (props: { show: boolean }) => {
  const [favorite, setFavorite] = useState('patterns');
  const { data: allBooks } = useQuery(ALL_BOOKS, {
    variables: { genre: 'patterns' },
  });

  if (!props.show) {
    return null;
  }

  const books = allBooks?.allBooks;

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        {'Books in your favorite  genre: '}
        <span
          style={{
            fontWeight: '900',
          }}
        >
          {favorite || ' '}
        </span>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books?.map(
            (a: {
              title: string;
              author: {
                name: string;
              };
              published: number;
            }) => (
              <tr key={a?.title}>
                <td>{a?.title}</td>
                <td>{a?.author?.name}</td>
                <td>{a?.published}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Recommend;
