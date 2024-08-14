import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector, useDispatch} from 'react-redux';
import { login, logout, registerSuccess, setProfile } from "./authSlice";
import { api, store, actionFullLogin, useUploadAvatarMutation, useSetUserNickMutation } from "./store";

const ShowLogin = () => {
  const login = useSelector((state) => state.auth.payload?.sub?.login || 'Anon');
  const nick = useSelector((state) => state.auth.payload?.sub?.nick || 'Unknown');
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
            onError={(e) => e.target.src = '../../logo.png'}
          />
        </>
      )}
      <div>
        <div>Hi, {login}!</div>
        {isLoggedIn && (
          <div className='nick-container'>Nickname: {nick}</div>
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
      <TextField 
        value={login} 
        onChange={(e) => setLogin(e.target.value)} 
        label="Login" 
        variant="outlined" 
        fullWidth 
        margin="normal"
      />
      <TextField 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        label="Password" 
        type="password" 
        variant="outlined" 
        fullWidth 
        margin="normal"
      />
      <Button onClick={handleRegister} variant="contained" color="primary">Register</Button>
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

  const authToken = useSelector((state) => state.auth.token);

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (avatar) {
      const formData = new FormData();
      formData.append('file', avatar);
  
      try {
        const response = await fetch('http://localhost:4000/upload', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${authToken}`, 
          },
        });
  
        const data = await response.json();
        
        if (data?.url) {
          dispatch(setProfile({ avatar: { url: data.url }}));
        }
  
      } catch (error) {
        console.error('Error uploading avatar:', error);
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
      <TextField 
        value={nick} 
        onChange={(e) => setNick(e.target.value)} 
        label="New Nickname" 
        variant="outlined" 
        fullWidth 
        margin="normal"
      />
      <input 
        type="file" 
        onChange={handleFileChange} 
      />
      <Button 
        onClick={handleUpload} 
        disabled={isAvatarLoading || isNickLoading}
        variant="contained" 
        color="primary"
      >
        Save Changes
      </Button>
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
      <TextField 
        value={login} 
        onChange={(e) => setLogin(e.target.value)} 
        label="Login" 
        variant="outlined" 
        fullWidth 
        margin="normal"
      />
      <TextField 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        label="Password" 
        type="password" 
        variant="outlined" 
        fullWidth 
        margin="normal"
      />
      <Button onClick={handleLogin} variant="contained" color="primary">Login</Button>
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
      <Dialog open={isLoginModalOpen} onClose={closeLoginModal}>
        <DialogTitle>
          Login
            <CloseIcon             edge="end" 
            color="inherit" 
            onClick={closeLoginModal} 
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }} />
        </DialogTitle>
        <DialogContent>
          <LoginForm onClose={closeLoginModal} />
          <p onClick={() => { closeLoginModal(); openRegisterModal(); }}>No account on Bits? Sign up</p>
        </DialogContent>
      </Dialog>
      <Dialog open={isRegisterModalOpen} onClose={closeRegisterModal}>
        <DialogTitle>
          Register
            <CloseIcon             edge="end" 
            color="inherit" 
            onClick={closeRegisterModal} 
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }} />
        </DialogTitle>
        <DialogContent>
          <RegisterForm onClose={closeRegisterModal} />
          <p onClick={() => { closeRegisterModal(); openLoginModal(); }}>Already have an account in Beats? Log In</p>
        </DialogContent>
      </Dialog>
      <Dialog open={isProfileModalOpen} onClose={closeProfileModal}>
        <DialogTitle>
          Edit Profile
            <CloseIcon             edge="end" 
            color="inherit" 
            onClick={closeProfileModal} 
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}/>
        </DialogTitle>
        <DialogContent>
          <ProfileModal onClose={closeProfileModal} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default App;