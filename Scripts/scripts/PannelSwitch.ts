declare module '../types/cluster-script.d.ts' {
  interface StateProxy {
    items: ItemHandle[] | null;
    pannelManager: ItemHandle | null;
    pannelManagerId: number | null;
    pannelManagerItemHandle: ItemHandle | null;
    switchNumber: number;
  }
}

function initialize() {
  $.state.items = null;
  $.state.pannelManager = null;
  $.state.pannelManagerId = null;
  $.state.pannelManagerItemHandle = null;

  const distance = 30;
  if ($.state.items == null)
    $.state.items = $.getItemsNear($.getPosition(), distance);

  // TODO: getStateCompat で取得できる integer の型は number でなく string になる？
  $.state.switchNumber = $.getStateCompat('this', 'SwitchNumber', 'integer');
}

$.onStart(() => {
  initialize();
});

$.onReceive((messageType, _arg, sender) => {
  switch (messageType) {
    case 'switchInitialize':
      $.state.pannelManager = sender;
      break;
  }
});

$.onInteract((player) => {
  $.log('Switch on Interact');
  const pannelManager = $.state.pannelManager;
  const switchNumber = $.state.switchNumber;
  $.log(switchNumber);
  pannelManager.send('onSwitchInteracted', {
    player: player,
    interactedSwitchNumber: switchNumber,
  });
});

$.onUpdate(() => {
  const pannelManagerId = $.state.pannelManagerId;
  setStatePannelManagerItemHandle(pannelManagerId);
});

function setStatePannelManagerItemHandle(pannelManagerId: number | null) {
  const isStateExist = Boolean($.state.pannelManagerItemHandle);
  if (isStateExist) return;

  const items = $.state.items;

  items.forEach((item) => {
    // TODO: getStateCompat で取得できる integer の型は string になる？
    if (item.id === pannelManagerId) {
      $.state.pannelManagerItemHandle = item;
    }
  });
}
