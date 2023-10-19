function Withdraw() {
    const [show, setShow] = React.useState(true);
    const [status, setStatus] = React.useState('');
    const loggedInUser = JSON.parse(localStorage.getItem('user')); // Retrieve user data from localStorage
  
    return (
      <Card
        bgcolor="success"
        header="Withdraw"
        // status={status}
        body={
          show ? (
            <WithdrawForm
              setShow={setShow}
              setStatus={setStatus}
              user={loggedInUser} // Pass the user data as a prop to the WithdrawForm component
            />
          ) : (
            <WithdrawMsg  user={loggedInUser} setShow={setShow} setStatus={setStatus}  />
          )
        }
      />
    );
  }
  function WithdrawMsg(props){
    return(<>
      <h5>Success {props.user.name}, your new balance is {props.user.balance} dollars</h5>
      <button type="submit" 
        className="btn btn-light" 
        onClick={() => {
          props.setShow(true);
          props.setStatus('');
        }}>
          Withdraw again
      </button>
    </>);
  }
  function WithdrawForm(props) {
    const [amount, setAmount] = React.useState('');
  
    function handle() {
      fetch(`/account/update/${props.user.email}/-${amount}`) // Assuming the email is stored in user.email
        .then(response => response.text())
        .then(text => {
          try {
            const data = JSON.parse(text);
            props.setStatus(JSON.stringify(data.value));
            props.setShow(false);
            console.log('JSON:', data);
          } catch (err) {
            props.setStatus('Withdrawal failed');
            console.log('err:', text);
          }
        });
    }
  
    return (
      <>
        Welcome Back: {props.user.name} {/* Display the user's name */}
        <br />
        Amount<br />
        <input
          type="number"
          className="form-control"
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.currentTarget.value)}
        />
        <br />
  
        <button type="submit" className="btn btn-light" onClick={handle}>
          Withdraw
        </button>
      </>
    );
  }
  