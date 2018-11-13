import React from 'react';

class Footer extends React.Component {
  render ()
  {
    return (
      <div style={style}>
        FOOTER
      </div>
    );
  }
}

const style=
{
  position: 'absolute',
  bottom: '0vh',
  left: '0vw',
  width: '100%',
  textAlign: 'center',
  backgroundColor: "gray"
}

export default Footer;
