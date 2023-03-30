import React from 'react';

import Avatar from '@mui/material/Avatar';

import configFile from '../../config.json'



export default class NagelsAvatar extends React.Component{

    stringToColor(string) {
        let hash = 0;
        let i;
      
        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
          hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
      
        let color = '#';
      
        for (i = 0; i < 3; i += 1) {
          const value = (hash >> (i * 8)) & 0xff;
          color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */
      
        return color;
    }

    render () {
        return(
            <Avatar 
                children = {this.props.username.toUpperCase()[0][0]}
                src={configFile.AVATAR_FOLDER + this.props.username + '.png'}
                sx={{ 
                    width: this.props.width, 
                    height: this.props.height , 
                    outline: this.props.outline,
                    bgcolor: this.stringToColor(this.props.username)
                }}
            ></Avatar>
        )
    }
}