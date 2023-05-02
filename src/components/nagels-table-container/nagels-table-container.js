import React from 'react';

import './nagels-table-container.css';

// MUI components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';


import Switch from '@mui/material/Switch';

import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

// local components
import FormButton from '../form-button';
import Score from '../score';
import NagelsAvatar from '../nagels-avatar/nagels-avatar';
import defaultTheme from '../../themes/default';
import Cookies from 'universal-cookie';
import { getText } from '../user-text';




export default class NagelsTableContainer extends React.Component{

    /*constructor(props) {
        super(props);
        this.state = {
           switcherState: []
        }
    }*/

    Cookies = new Cookies();

    /*handleSwitchChange = (event, switcherRowIndex) => {
        const isChecked = event.target.checked;
        var newSwitcherState = this.state.switcherState
        newSwitcherState.findIndex(switcher => switcher.id === switcherRowIndex)
        if (switcherRowIndex > 0){
            newSwitcherState[switcherRowIndex].checked = isChecked
        } else {
            newSwitcherState.push(
                {
                    id: switcherRowIndex,
                    checked: isChecked
                }
            )
        }
        this.setState({ switcherState: newSwitcherState })
    }*/

    componentDidMount = () => {
        /*var newSwitcherState = this.state.switcherState
        this.props.rows.forEach(row => {
            row.dataArray.foreach(data => {
                if(data.type === 'switch'){
                    newSwitcherState.push({
                        id: row.id,
                        checked: data.checked
                    })
                }
            })
        });
        this.setState({ switcherState: newSwitcherState })*/
    }

    render() {

        const StyledTableCell = styled(TableCell)(() => ({
            [`&.${tableCellClasses.head}`]: {
                backgroundColor: defaultTheme.palette.contrastControlPanel.main,
                color: defaultTheme.palette.contrastControlElements.main,
                fontWeight: 'bold',
                borderRight: '1px dotted ' + defaultTheme.palette.borderColor.light,
                borderBottom: 'none',
                overflow: 'hidden'
            },
            [`&.${tableCellClasses.body}`]: {
                fontSize: 14,
                color: this.Cookies.get('colorScheme') === 'piggy' ? defaultTheme.palette.regularText.piggy : defaultTheme.palette.regularText.main,
                padding: this.props.padding || '16px',
                borderRight: '1px dotted ' + defaultTheme.palette.borderColor.light,
                borderBottom: 'none',
                overflow: 'hidden'
            }
        }));

        return(
            <TableContainer 
                component={Paper} 
                sx={{ 
                    height:this.props.height, 
                    overflow: 'scroll', 
                    boxShadow: 'none',
                    zIndex: this.props.onboarding ? 101 : 'unset',
                    border: this.props.onboarding ? '2px solid ' + (this.Cookies.get('colorScheme') === 'piggy' ? defaultTheme.palette.primary.piggy : defaultTheme.palette.primary.main) : 'unset',
                    boxSizing: 'border-box',
                    borderRadius: '2px'
                }}>
                <Table stickyHeader aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {this.props.headers.map(header => {
                                return this.props.playerHeaders && header ? 
                                    <StyledTableCell key={header} align='center'>
                                        <div className='player-table-data-container'>
                                            <div className="avatar-small">
                                                <NagelsAvatar
                                                    width = "38px"
                                                    height = "38px"
                                                    username = {header}
                                                ></NagelsAvatar>
                                            </div>
                                            <div 
                                                className="username-container" 
                                                onClick={()=>window.location.assign('/profile/' + header)}
                                            >{header}</div>
                                        </div>
                                    </StyledTableCell>
                                    :
                                    <StyledTableCell key={header} align='center'>{header}</StyledTableCell>
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {this.props.rows.map(row => {
                        return (
                            <TableRow
                                key={row.id}
                                sx={{ bgcolor: row.id === 'total' ? defaultTheme.palette.totalRow.main : 'none' }}
                                onClick={this.props.onClick ? (event) => this.props.onClick(event, row.id) : ''}
                                selected={row.id === this.props.selected}
                            >
                                {
                                    row.dataArray.map(data => {
                                            switch(data.type){
                                                case 'text':
                                                    return(
                                                        <StyledTableCell key={`row ${row.id} column ${row.dataArray.indexOf(data)}`} align='center'>
                                                            {data.value}
                                                        </StyledTableCell>
                                                    )
                                                case 'player':
                                                    return(
                                                        <StyledTableCell key={`row ${row.id} column ${row.dataArray.indexOf(data)}`} align='center'>
                                                            <div className='player-table-data-container'>
                                                                <div className="avatar-small">
                                                                    <NagelsAvatar
                                                                        width = "38px"
                                                                        height = "38px"
                                                                        username = {data.username}
                                                                    ></NagelsAvatar>
                                                                </div>
                                                                <div 
                                                                    className="username-container" 
                                                                    onClick={()=>window.location.assign('/profile/' + data.username)}
                                                                >{data.username}</div>
                                                                {data.host ? <div className="admin-icon-container"> <SupervisorAccountIcon/> </div> : ''}
                                                            </div>
                                                        </StyledTableCell>
                                                    )
                                                case 'switch':
                                                    /*var switcherDataIndex = this.state.switcherState.findIndex(switcher => switcher.id === row.id)
                                                    if (switcherDataIndex < 0){
                                                        switcherDataIndex = row.id
                                                    }*/
                                                    return(
                                                        <StyledTableCell key={`row ${row.id} column ${row.dataArray.indexOf(data)}`} align='center'>
                                                            <Switch
                                                                inputProps={{ 'aria-label': 'controlled' }}
                                                                key={`ready-switch-${data.username}`}
                                                                id={`ready-switch-${data.username}`}
                                                                //defaultChecked={data.defaultChecked}
                                                                checked={data.checked}
                                                                disabled={data.disabled}
                                                                username={data.username}
                                                                onChange={data.onChange}
                                                                //onChange={this.handleSwitchChange(switcherDataIndex)}
                                                            />
                                                        </StyledTableCell>
                                                    )
                                                case 'button':
                                                    return(
                                                        <StyledTableCell key={`row ${row.id} column ${row.dataArray.indexOf(data)}`} align='center'>
                                                            <FormButton 
                                                                variant={data.variant}
                                                                text={data.text}
                                                                onSubmit={data.onSubmit}
                                                                width={data.width}
                                                                size={data.size}
                                                                disabled={data.disabled}
                                                                color = {data.color}
                                                            ></FormButton>
                                                        </StyledTableCell>
                                                    )
                                                case 'hand id':
                                                    return(
                                                        <StyledTableCell key={`row ${row.id} column ${row.dataArray.indexOf(data)}`} align='center'>
                                                            <p key={`handspan ${data.cards}-${data.trump}-${row.dataArray.indexOf(data)}`} className={`${data.trump} suit-container ${this.Cookies.get('deckType') === '4color' ? 'fourcolor' : ''}`}>{data.cards}</p>
                                                        </StyledTableCell>
                                                    )
                                                case 'score':
                                                    return(
                                                        <StyledTableCell key={`row ${row.id} column ${row.dataArray.indexOf(data)}`} align='center'>
                                                            <Score
                                                                total={data.total}
                                                                betSize={data.betSize}
                                                                tookTurns={data.tookTurns}
                                                                bonus={data.bonus}
                                                                score={data.score}
                                                            ></Score>
                                                        </StyledTableCell>
                                                    )
                                                case 'scores subtitle':
                                                    return(
                                                        <StyledTableCell key={`row ${row.id} column ${row.dataArray.indexOf(data)}`} align='center'>
                                                            <Score
                                                                betSize={getText('bet')}
                                                                score={getText('score')}
                                                            ></Score>
                                                        </StyledTableCell>
                                                    )
                                                default: // text
                                                    return(
                                                        <StyledTableCell key={`row ${row.id} column ${row.dataArray.indexOf(data)}`} align='center'>
                                                            {data.value}
                                                        </StyledTableCell>
                                                    )
                                            }
                                        })
                                } 
                            </TableRow>
                        )
                    })}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }
}