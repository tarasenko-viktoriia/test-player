import React, { useState } from 'react';

import { Provider, useSelector, useDispatch } from 'react-redux';
import Modal from 'react-modal';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { login, logout, registerSuccess, setProfile } from "./authSlice"
import {api, store, actionFullLogin, useUploadAvatarMutation, useSetUserNickMutation} from "./store"

const ShowLogin = () => {
  const login = useSelector((state) => state.auth.payload?.sub?.login || 'Anon');
  const nick = useSelector((state) => state.auth.payload?.sub?.nick || 'Unknown');;
  const avatarUrl = useSelector((state) => state.auth.profile?.avatar?.url);
  const isLoggedIn = useSelector((state) => Boolean(state.auth.token));

  console.log('Login:', login, 'Nickname:', nick, 'Avatar URL:', avatarUrl, 'Is Logged In:', isLoggedIn);

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
        <div>Hi, {login}!</div>
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
      const result = await uploadAvatar({ id: userId, avatar: formData });
      if (result.data?.UserUpsert?.avatar?.url) {
        console.log('Uploaded Avatar URL:', result.data.UserUpsert.avatar.url); 
        dispatch(setProfile({ avatar: { url: result.data.UserUpsert.avatar.url } }));
      }
    }
  
    if (nick) {
      const result = await setUserNick({ id: userId, nick });
      if (result.data?.updateUserNick?.nick) {
        dispatch(setProfile({ nick: result.data.updateUserNick.nick }));
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
    <> 
        <Header onLoginClick={openLoginModal} onRegisterClick={openRegisterModal} onProfileClick={openProfileModal} />
        <Modal isOpen={isLoginModalOpen} onRequestClose={closeLoginModal}>
          <h2>Login</h2>
          <LoginForm onClose={closeLoginModal} />
          <p onClick={() => { closeLoginModal(); openRegisterModal(); }}>Якщо ви не зареєстровані, натисніть тут</p>
        </Modal>
        <Modal isOpen={isRegisterModalOpen} onRequestClose={closeRegisterModal}>
        <h2>Register</h2>
        <RegisterForm onClose={closeRegisterModal} />
      </Modal>
        <Modal isOpen={isProfileModalOpen} onRequestClose={closeProfileModal}>
          <h2>Edit Profile</h2>
          <ProfileModal onClose={closeProfileModal} />
        </Modal>
    </>
  );
};


export default App;
