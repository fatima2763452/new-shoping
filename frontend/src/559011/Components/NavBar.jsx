import * as React from 'react';
import { Link } from "react-router-dom";
import { useState } from "react";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';


const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

function NavBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);


  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>
       

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
             <MenuItem component={Link} to="/form" onClick={handleCloseNavMenu}>
                <Typography sx={{ textAlign: 'center' }}>Home</Typography>
              </MenuItem>
              <MenuItem component={Link} to="/formTwo" onClick={handleCloseNavMenu}>
                <Typography sx={{ textAlign: 'center' }}>Tred buy receipt</Typography>
              </MenuItem>
              <MenuItem component={Link} to="/holdings" onClick={handleCloseNavMenu}>
                <Typography sx={{ textAlign: 'center' }}>Holdings</Typography>
              </MenuItem>
              <MenuItem component={Link} to="/pavti" onClick={handleCloseNavMenu}>
                <Typography sx={{ textAlign: 'center' }}>Pavti</Typography>
              </MenuItem>
              <MenuItem component={Link} to="/averageCalce" onClick={handleCloseNavMenu}>
                <Typography sx={{ textAlign: 'center' }}>Average Calce</Typography>
              </MenuItem>
               <MenuItem component={Link} to="/investForm" onClick={handleCloseNavMenu}>
                <Typography sx={{ textAlign: 'center' }}>Invest Form</Typography>
              </MenuItem>
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/form"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button component={Link} to="/form" onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
              Home
            </Button>
            <Button component={Link} to="/formTwo" onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
              Tred buy receipt
            </Button>
            <Button component={Link} to="/holdings" onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
              Holdings
            </Button>
             <Button component={Link} to="/pavti" onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
              Pavti
            </Button>
            <Button component={Link} to="/averageCalce" onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
              Average Calce
            </Button>
            <Button component={Link} to="/investForm" onClick={handleCloseNavMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
              Invest Form
            </Button>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default NavBar;
