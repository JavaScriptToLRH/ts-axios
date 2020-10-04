const cookie = {
  read(name: string): string | null {
    // 通过正则解析到 name 对应的值
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : null;
  },
};

export default cookie;
