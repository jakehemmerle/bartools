#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("BarBack-Swift.h")
#import "BarBack-Swift.h"
#else
@class BottleSegFrameProcessor;
#endif

@interface BottleSegFrameProcessorLoader : NSObject
@end

@implementation BottleSegFrameProcessorLoader

+ (void)load {
  [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"bottleSeg"
                                       withInitializer:^FrameProcessorPlugin *(VisionCameraProxyHolder *proxy, NSDictionary *options) {
    return [[BottleSegFrameProcessor alloc] initWithProxy:proxy withOptions:options];
  }];
}

@end
