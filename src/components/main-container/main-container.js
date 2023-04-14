import React, { useEffect, useRef } from 'react';
import './main-container.css'
import { useMediaQuery } from 'react-responsive';

// Local components
import NavMenu from '../nav-menu';
import ActiveContainer from '../active-container';
import Cookies from 'universal-cookie';


const cookies = new Cookies();

const MainContainer = () => {
    var isMobile = false
    var isDesktop = false
    const isPortrait = useMediaQuery({ query: '(orientation: portrait)' })
    const isMobileWidth = useMediaQuery({query: '(max-width: 480px)'})
    const isDesktopWidth = useMediaQuery({query: '(min-width: 1024px)'})
    const isMobileHeight = useMediaQuery({query: '(max-height: 480px)'})
    // const isDesktopHeight = useMediaQuery({query: '(min-height: 700px)'})
    if(isPortrait){
        isMobile = isMobileWidth
        isDesktop = isDesktopWidth
    } else {
        isMobile = isMobileHeight
        isDesktop = true /* isDesktopHeight */ 
    }

    const containerRef = useRef(null);

    useEffect(() => {
      if (containerRef.current && !isDesktop && isPortrait) {
        containerRef.current.scrollTo(0, containerRef.current.scrollHeight - window.innerHeight * 0.08);
      }
    }, []);

    
    return (
        <div className={`root-container ${cookies.get('colorScheme')==='dark' ? 'dark-theme' : ''}`}>   
            <NavMenu 
                isMobile = {isMobile}
                isDesktop = {isDesktop}
                isPortrait = {isPortrait}
            ></NavMenu>
            <div className={`main-container ${ isMobile ? "mobile" : (isDesktop ? "desktop" : "tablet")} ${ isPortrait ? "portrait" : "landscape"}`}>
                <ActiveContainer
                    isMobile = {isMobile}
                    isDesktop = {isDesktop}
                    isPortrait = {isPortrait}
                ></ActiveContainer>
            </div>
        </div>
    )
}

export default MainContainer;
