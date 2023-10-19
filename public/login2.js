function Login() {
  const ctx = React.useContext(UserContext);
  const [show, setShow] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  function handleLogin() {
    fetch(`/account/login/${email}/${password}`)
      .then((response) => response.text())
      .then((text) => {
        try {
          const data = JSON.parse(text);
          setStatus('Login successful');
          setShow(false);
          ctx.setUser(data.value); // Set the user data in the context
          console.log('JSON:', data);
        } catch (err) {
          setStatus(text);
          console.log('err:', text);
        }
      });
  }

  function LoginMsg(props) {
    const { user } = props;
    return (
      <>
        <h5>Success</h5>
        <button
          type="submit"
          className="btn btn-light"
          onClick={() => {
            props.setShow(true);
            props.setStatus('');
          }}
        >
          Authenticate again
        </button>
        {user && (
          <>
            <h5>User: {user.name}</h5>
            <h5>Balance: {user.balance}</h5>
          </>
        )}
      </>
    );
  }

  function LoginForm() {
    return (
      <>
        Email
        <br />
        <input
          type="input"
          className="form-control"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <br />
        Password
        <br />
        <input
          type="password"
          className="form-control"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        <br />
        <button type="submit" className="btn btn-light" onClick={handleLogin}>
          Login
        </button>
      </>
    );
  }

  return (
    <div>
      <Card
        bgcolor="secondary"
        header="Login"
        status={status}
        body={show ? <LoginForm /> : <LoginMsg setShow={setShow} setStatus={setStatus} user={ctx.user}/>}
      />
    </div>
  );
}
