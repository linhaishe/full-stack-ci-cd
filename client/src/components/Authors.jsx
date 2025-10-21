/* eslint-disable react/prop-types */
import { ALL_AUTHORS } from '../queries';
import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { EDIT_AUTHOR } from '../queries';

const Authors = (props) => {
  const allAuthors = useQuery(ALL_AUTHORS);
  const [authorName, setAuthorName] = useState('');
  const [birth, setBirth] = useState('');
  const [editAuthor, result] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  if (!props.show) {
    return null;
  }

  if (!allAuthors) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    if (!authorName) {
      alert('请选择一个作者');
      return;
    }
    editAuthor({ variables: { name: authorName, setBornTo: birth } });
    setAuthorName('');
    setBirth('');
  };
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {(allAuthors || [])?.data?.allAuthors?.map((a) => (
            <tr key={a?.id}>
              <td>{a?.name}</td>
              <td>{a?.born || 'not know'}</td>
              <td>{a?.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props?.token && (
        <form onSubmit={submit}>
          authorName:
          <select
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          >
            <option value='' disabled>
              -- 请选择作者 --
            </option>
            {(allAuthors || [])?.data?.allAuthors?.map((a) => (
              <option value={a?.name} key={a.id}>
                {a?.name}
              </option>
            ))}
          </select>
          {/* <select>
          <option value='someOption'>Some option</option>
          <option value='otherOption'>Other option</option>
        </select> */}
          {/* <input
          type='text'
          value={authorName}
          onChange={({ target }) => setAuthorName(target.value)}
        /> */}
          <br />
          birth:
          <input
            type='number'
            value={birth}
            onChange={({ target }) => setBirth(Number(target.value))}
          />
          <button type='submit'>set born</button>
        </form>
      )}
    </div>
  );
};

export default Authors;
