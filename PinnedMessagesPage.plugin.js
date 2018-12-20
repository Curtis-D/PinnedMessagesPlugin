//META{"name":"PinnedMessagesPage"}*//
var PinnedMessagesPage;

PinnedMessagesPage = function() {
    var React, ReactDOM, WebpackModules, MessagesPopout, originalRenderPopout, defineComponents, PinnedMessagesPageWrapper;

    class PinnedMessagesPage {

        getName() {
            return "PinnedMessagesPage";
        }

        getDescription() {
            return "Changes your Pinned Messages popout into a channel sized view and allows you to copy and paste messages from the page. Huge thanks to square for all his help.";
        }

        getVersion() {
            return "1.0.3";
        }

        getAuthor() {
            return "Green";
        }

        load() {
            ({
                reactDom: ReactDOM,
                react: React,
                WebpackModules
            } = BDV2);

            defineComponents();
        }

        start() {

            MessagesPopout = WebpackModules.find(module => module.displayName === "MessagesPopout" && module.prototype.render);

            originalRenderPopout = MessagesPopout.prototype.render;

            MessagesPopout.prototype.render = function() {
                var returnOriginal = originalRenderPopout.call(this);
                try {
                    let messagesWrapper = document.querySelector(".messagesWrapper-3lZDfY");
                    let channelName = document.querySelector(".channelName-3stJzi");
                    let [messagesHeader, messagesPopout] = returnOriginal.props.children;

                    switch(this.props.analyticsName) {
                    case "Channel Pins":
                        return ReactDOM.createPortal(
                            React.createElement(PinnedMessagesPageWrapper, {
                                messagesWrapper,
                                messagesPopout,
                                channelName,
                                owner: this
                            }),
                            messagesWrapper
                        );
                    }
                } catch (err) {
                    console.error(err);
                }

                return returnOriginal;
            };

        }

        stop() {
            originalRenderPopout && (MessagesPopout.prototype.render = originalRenderPopout);
            originalRenderPopout = null;
        }


    };

    defineComponents = function() {
        PinnedMessagesPageWrapper = class extends React.PureComponent {
            constructor() {
                super(...arguments);
                this.state = {
                    scrollerWrap: this.props.messagesWrapper.querySelector(".scroller-wrap"),
                    channelName: this.props.channelName.lastChild
                };
            }

            componentDidUpdate() {
                this.stylePage();
            }

            componentDidMount() {
                this.stylePage();
                this.state.scrollerWrap.style = "display:none";
                this.state.channelName.textContent += " - Pinned Messages";
                this.removeCloseListeners();
            }

            componentWillUnmount() {
                let channelNameText = this.state.channelName.textContent;
                if(channelNameText.substr(channelNameText.length - 18) == " - Pinned Messages")
                    this.state.channelName.textContent = this.state.channelName.textContent.slice(0, -18);
                this.state.scrollerWrap.removeAttribute("style");
                if(document.querySelector(".content-yTz4x3 .messagesWrapper-3lZDfY ~ form"))
                    document.querySelector(".content-yTz4x3 .messagesWrapper-3lZDfY ~ form").style.display = "initial";
            }

            removeCloseListeners() {
                let element = this.props.owner._reactInternalFiber;
                do element = element.return;
                while (element.stateNode.constructor && element.stateNode.constructor.displayName !== "Popout");

                let {
                    close,
                    closeContext
                } = element.stateNode;

                process.nextTick(() => {
                    document.removeEventListener("click", close, true);
                    document.removeEventListener("contextmenu", closeContext, true);
                });
            }

            stylePage() {
                let pinnedMessagesPage = this.props.messagesWrapper.querySelector(".scroller-wrap");

                document.querySelectorAll(".clickOverride-1J40_l").forEach((element) => {
                    
                    element.style.display = "none";
                });
                pinnedMessagesPage.querySelectorAll(".message.first").forEach((element) => {
                    element.style.maxWidth = "100%";
                });
                pinnedMessagesPage.querySelectorAll(".body").forEach((element) => {
                    element.style.webkitUserSelect = "text";
                });
                pinnedMessagesPage.querySelectorAll(".actionButtons-1sUUug").forEach((element) => {
                    element.style.boxShadow = "inherit";
                    element.style.backgroundColor = "inherit";
                });
                pinnedMessagesPage.querySelectorAll(".jumpButton-3DTcS_").forEach((element) => {
                    element.style.backgroundColor = "inherit";
                });
                document.querySelector(".content-yTz4x3 .messagesWrapper-3lZDfY ~ form").style.display = "none";
            }

            render() {
                return React.cloneElement(this.props.messagesPopout);
            }
        };
    };

    return PinnedMessagesPage;

}();
