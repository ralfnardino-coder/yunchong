export function checkBlindBoxTrigger(level: number): boolean {
  const triggerLevels = [3, 5, 8, 12];
  return triggerLevels.includes(level);
}

export function openBlindBox(): string {
  const rewards = ["稀有宠物皮肤", "24小时成长翻倍卡", "专属互动道具", "神秘宠物碎片*5"];
  const randomIndex = Math.floor(Math.random() * rewards.length);
  const reward = rewards[randomIndex];
  
  // NOTE: alert() is used here for demonstration.
  // In a production app, you might want to use a custom modal for better UI/UX.
  alert("恭喜解锁成长盲盒，获得奖励：" + reward);
  return reward;
}
