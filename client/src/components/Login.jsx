/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { LOGIN } from '../queries';
import { useMutation } from '@apollo/client';

export default function Login(props) {
  const [userName, setUserName] = useState('');
  const [pwd, setPwd] = useState('');
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error.graphQLErrors[0].message);
    },
    onSuccess: () => {},
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      sessionStorage.setItem('library-user-token', token);
      props.setToken(token);
      props.setPage('authors');
    }
  }, [result.data]);

  if (!props.show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    login({ variables: { username: userName, password: pwd } });
  };

  return (
    <div>
      <form onSubmit={submit}>
        name:
        <input
          type='text'
          value={userName}
          onChange={({ target }) => setUserName(target.value)}
        />
        <br />
        password:
        <input
          type='password'
          value={pwd}
          onChange={({ target }) => setPwd(target.value)}
        />
        <br />
        <button type='submit'>Login</button>
      </form>
    </div>
  );
}
