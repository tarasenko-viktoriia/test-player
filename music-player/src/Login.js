import React, { useState } from 'react';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Link} from 'react-router-dom'
import { createBrowserHistory } from 'history';
import { createApi } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import Modal from 'react-modal';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

const history = createBrowserHistory();

function jwtDecode(token) {
  try {
    const [, data] = token.split('.');
    const json = atob(data);
    const result = JSON.parse(json);
    return result;
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}

const ShowLogin = () => {
  const login = useSelector((state) => state.auth.payload?.sub.login);
  const nick = useSelector((state) => state.auth.payload?.sub.nick);
  const avatarUrl = useSelector((state) => state.auth.profile?.avatar?.url);
  const isLoggedIn = useSelector((state) => state.auth.token);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {isLoggedIn && (
        <>
          <img
            src={avatarUrl || '../../logo.png'}
            alt="avatar"
            style={{ width: '50px', borderRadius: '50%', marginRight: '10px' }}
          />
        </>
      )}
      <div>
        <div>Hi, {login || 'Anon'}!</div>
        {isLoggedIn && (
          <div>Nickname: {nick}</div>
        )}
      </div>
    </div>
  );
};


const Logout = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.token);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isLoggedIn) {
    return null; 
  }

  return (
    <LogoutIcon onClick={handleLogout}/>
  );
};

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: null, payload: null, profile: null },
  reducers: {
    login(state, { payload: token }) {
      const decoded = jwtDecode(token);
      if (decoded) {
        state.payload = decoded;
        state.token = token;
      }
    },
    logout(state) {
      state.payload = null;
      state.token = null;
      state.profile = null;
    },
    setProfile(state, { payload }) {
      if (payload.avatar) {
        state.profile = { ...state.profile, avatar: payload.avatar };
      }
      if (payload.nick) {
        state.payload = { ...state.payload, sub: { ...state.payload.sub, nick: payload.nick } };
      }
    },
    registerSuccess(state, { payload: token }) {
      const decoded = jwtDecode(token);
      if (decoded) {
        state.payload = decoded;
        state.token = token;
      }
    },
  },
});


const { login, logout, registerSuccess, setProfile } = authSlice.actions;

const api = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: 'http://player.node.ed.asmer.org.ua/graphql',
    prepareHeaders(headers, { getState }) {
      const { token } = getState().auth;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getRootCats: builder.query({
      query: () => ({
        document: `query {
          CategoryFind(query: "[{\\"parent\\": null}]"){
            _id name
          }
        }`,
      }),
    }),
    login: builder.mutation({
      query: ({ login, password }) => ({
        document: `
          query login($login: String!, $password: String!) {
            login(login: $login, password: $password) 
          }
        `,
        variables: { login, password },
      }),
    }),
    getUserById: builder.query({
      query: ({ _id }) => ({
        document: `query oneUser($query: String){
          UserFindOne(query: $query){
            _id login nick avatar { url }
          }
        }`,
        variables: { query: JSON.stringify([{ _id }]) },
      }),
      providesTags: (result, error, { _id }) => [{ type: 'User', id: _id }],
    }),
    setUserNick: builder.mutation({
      query: ({ _id, nick }) => ({
        document: `
          mutation setNick($_id: String!, $nick: String!) {
            UserUpsert(user: { _id: $_id, nick: $nick }) {
              _id nick
            }
          }
        `,
        variables: { _id, nick },
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'User', id: _id }],
    }),
    registerUser: builder.mutation({
      query: ({ login, password }) => ({
        document: `
          mutation register($login: String!, $password: String!) {
            createUser(login: $login, password: $password) {
              _id login
            }
          }
        `,
        variables: { login, password },
      }),
      async onQueryStarted({ login, password }, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;
          console.log('Registration result:', result);
          if (result.data && result.data.createUser) {
            const loginResult = await dispatch(api.endpoints.login.initiate({ login, password })).unwrap();
            console.log('Login result:', loginResult);
            if (loginResult?.login) {
              dispatch(registerSuccess(loginResult.login));
              await dispatch(actionAboutMe());
            }
          }
        } catch (error) {
          console.error('Registration or login error:', error);
        }
      },
    }),
    uploadAvatar: builder.mutation({
      query: ({ _id, avatar }) => ({
        document: `
          mutation uploadAvatar($_id: String!, $avatar: ImageInput!) {
            UserUpsert(user: { _id: $_id, avatar: $avatar }) {
              _id
              avatar {
                url
              }
            }
          }
        `,
        variables: { _id, avatar },
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'User', id: _id }],
    }),
  }),
});

const { useGetUserByIdQuery, useLoginMutation, useSetUserNickMutation, useUploadAvatarMutation } = api;

const actionFullLogin = ({ login, password }) => async (dispatch) => {
  try {
    const token = await dispatch(api.endpoints.login.initiate({ login, password }));
    if (token?.data?.login) {
      dispatch(authSlice.actions.login(token.data.login));
      await dispatch(actionAboutMe());
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};

const actionAboutMe = () => async (dispatch, getState) => {
  const { auth } = getState();
  if (auth.payload) {
    const { id } = auth.payload.sub;
    await dispatch(api.endpoints.getUserById.initiate({ _id: id }));
  }
};

const RegisterForm = ({ onClose }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleRegister = async () => {
    try {
      const result = await dispatch(api.endpoints.registerUser.initiate({ login, password })).unwrap();
      if (result?.createUser) {
        onClose();
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div>
      <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Login" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

const ProfileModal = ({ onClose }) => {
  const [nick, setNick] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [uploadAvatar, { isLoading: isAvatarLoading }] = useUploadAvatarMutation();
  const [setUserNick, { isLoading: isNickLoading }] = useSetUserNickMutation();
  const userId = useSelector((state) => state.auth.payload?.sub?.id);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (avatar) {
      const formData = new FormData();
      formData.append('avatar', avatar);
      const result = await uploadAvatar({ _id: userId, avatar: formData });
      if (result.data?.UserUpsert?.avatar?.url) {
        console.log('Uploaded Avatar URL:', result.data.UserUpsert.avatar.url); // Додайте цей рядок
        dispatch(setProfile({ avatar: { url: result.data.UserUpsert.avatar.url } }));
      }
    }
  
    if (nick) {
      const result = await setUserNick({ _id: userId, nick });
      if (result.data?.UserUpsert?.nick) {
        dispatch(setProfile({ nick: result.data.UserUpsert.nick }));
      }
    }
  
    onClose();
  };

  return (
    <div>
      <input 
        value={nick} 
        onChange={(e) => setNick(e.target.value)} 
        placeholder="New Nickname" 
      />
      <input 
        type="file" 
        onChange={handleFileChange} 
      />
      <button 
        onClick={handleUpload} 
        disabled={isAvatarLoading || isNickLoading}
      >
        Save Changes
      </button>
    </div>
  );
};


const store = configureStore({
  reducer: {
    [authSlice.name]: persistReducer({ key: 'auth', storage }, authSlice.reducer),
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

const persistor = persistStore(store);

const LoginForm = ({ onClose }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleLogin = () => {
    dispatch(actionFullLogin({ login, password }));
    onClose();
  };

  return (
    <div>
      <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Login" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

const Header = ({ onLoginClick, onRegisterClick, onProfileClick }) => {
  const isLoggedIn = useSelector((state) => state.auth.token);

  return (
    <header>
      <ShowLogin />
      {!isLoggedIn && (
        <>
        <LoginIcon onClick={onLoginClick}/>
        </>
      )}
      {isLoggedIn && (
        <>
          <EditIcon onClick={onProfileClick}/>
          <Logout />
        </>
      )}
    </header>
  );
};

const App = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);
  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  return (
    <Provider store={store}>
      <Router history={history}>
          <Header onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} onProfileClick={openProfileModal} />
            <Modal isOpen={isLoginModalOpen} onRequestClose={closeLoginModal}>
              <h2>Login</h2>
              <LoginForm onClose={closeLoginModal} />
              <p onClick={() => { closeLoginModal(); openRegisterModal(); }}>Якщо ви не зареєстровані, натисність тут</p>
            </Modal>
            <Modal isOpen={isRegisterModalOpen} onRequestClose={closeRegisterModal}>
              <h2>Register</h2>
              <RegisterForm onClose={closeRegisterModal} />
            </Modal>
            <Modal isOpen={isProfileModalOpen} onRequestClose={closeProfileModal}>
              <h2>Edit Profile</h2>
              <ProfileModal onClose={closeProfileModal} />
            </Modal>
      </Router>
    </Provider>
  );
};


export default App;
