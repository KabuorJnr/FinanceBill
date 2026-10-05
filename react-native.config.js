module.exports = {
  dependency: {
    platforms: {
      ios: {},
      android: {
        libraryName: 'MorphletSpec',
        componentDescriptors: [
          'MorphletContainerViewComponentDescriptor',
          'MorphletHostViewComponentDescriptor',
          'MorphletSwitchViewComponentDescriptor',
        ],
        cmakeListsPath: 'src/main/jni/CMakeLists.txt',
      },
    },
  },
};
