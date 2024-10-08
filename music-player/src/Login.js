import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector, useDispatch} from 'react-redux';
import { logout, setProfile } from "./authSlice";
import { api, actionFullLogin, useSetUserNickMutation } from "./store";

const ShowLogin = () => {
  const login = useSelector((state) => state.auth.payload?.sub?.login || 'Anon');
  const nick = useSelector((state) => state.auth.payload?.sub?.nick || 'Unknown');
  const avatarUrl = useSelector((state) => state.auth.profile?.avatar?.url);
  const isLoggedIn = useSelector((state) => Boolean(state.auth.token));

  return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
          {isLoggedIn ? (
              <>
                  <img
                      src={avatarUrl || '../../logo.png'}
                      alt="avatar"
                      style={{ width: '50px', borderRadius: '50%', marginRight: '10px' }}
                      onError={(e) => e.target.src = '../../logo.png'}
                  />
                  <div>
                      <div>Hi, {login}!</div>
                      <div className='nick-container'>Nickname: {nick}</div>
                  </div>
              </>
          ) : (
              <div>Hi, Anon!</div>
          )}
      </div>
  );
}

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
      const registerResult = await dispatch(api.endpoints.registerUser.initiate({ login, password })).unwrap();
      
      if (registerResult?.createUser) {
        const loginResult = await dispatch(actionFullLogin({ login, password })).unwrap();
        
        if (loginResult?.token) {
          onClose(); 
        } else {
          console.error('Login failed');
          onClose(); 
        }
      }
    } catch (error) {
      console.error('Registration or login failed:', error);
      onClose(); 
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
  const [setUserNick] = useSetUserNickMutation();
  const userId = useSelector((state) => state.auth.payload?.sub?.id);
  const dispatch = useDispatch();

  const handleUpload = async () => {
  
    if (nick) {
      try {
        const result = await setUserNick({ id: userId, nick }).unwrap();
        if (result?.updateUserNick?.nick) {
          dispatch(setProfile({ nick: result.updateUserNick.nick }));
        }
      } catch (error) {
        console.error('Error updating nickname:', error);
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
      <Button
        onClick={handleUpload}
        disabled={!nick}
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

const Header = ({ onLoginClick, onProfileClick }) => {
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

const Login = () => {
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

export default Login;