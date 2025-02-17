async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
  
    // Validasi input
    if (!username || !password) {
      alert('Please fill in both username and password.');
      return;
    }
  
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        alert('Login successful!');
        const data = await response.json();
        alert(data.token)
        localStorage.setItem("token", data.token)
        window.location.href = 'dashboard.html';
      } else {
        const errorData = await response.json();
        localStorage.removeItem("token")
        alert(errorData.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error('Error during login:', err);
      localStorage.removeItem("token")
      alert('An error occurred during login. Please try again later.');
    }
  }
  
  async function logout() {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) {
        window.location.href = 'index.html';
        localStorage.removeItem("token")
      } else {
        alert('Failed to log out. Please try again.');
      }
    } catch (err) {
      console.error('Error during logout:', err);
      alert('An error occurred during logout. Please try again later.');
    }
  }
  