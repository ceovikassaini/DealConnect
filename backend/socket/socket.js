module.exports = function (io) {
  io.on('connection', (socket) => {
    socket.on('join_admin', () => {
      socket.join('admin_panel');
    });

    socket.on('job:subscribe', () => {
      socket.join('jobs');
    });
  });
};
