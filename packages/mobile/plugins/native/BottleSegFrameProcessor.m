#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("BarTools-Swift.h")
#import "BarTools-Swift.h"
#elif __has_include("BarToolsStaging-Swift.h")
#import "BarToolsStaging-Swift.h"
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
