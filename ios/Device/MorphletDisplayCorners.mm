//
//  MorphletDisplayCorners.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletDisplayCorners.h"
#import "MorphletDeviceModel.h"

static const CGFloat kLatestPhoneCornerRadius = 62;
static const CGFloat kPadCornerRadius = 18;

static NSDictionary<NSString *, NSNumber *> *MorphletCornerRadiusByModel(void) {
  static NSDictionary<NSString *, NSNumber *> *table;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    NSDictionary<NSNumber *, NSArray<NSString *> *> *modelsByRadius = @{
      @39.0 : @[ @"iPhone10,3", @"iPhone10,6", @"iPhone11,2", @"iPhone11,4", @"iPhone11,6", @"iPhone12,3", @"iPhone12,5" ],
      @41.5 : @[ @"iPhone11,8", @"iPhone12,1" ],
      @44.0 : @[ @"iPhone13,1", @"iPhone14,4" ],
      @47.33 : @[ @"iPhone13,2", @"iPhone13,3", @"iPhone14,2", @"iPhone14,5", @"iPhone14,7", @"iPhone17,5" ],
      @53.33 : @[ @"iPhone13,4", @"iPhone14,3", @"iPhone14,8" ],
      @55.0 : @[
        @"iPhone15,2", @"iPhone15,3", @"iPhone15,4", @"iPhone15,5", @"iPhone16,1", @"iPhone16,2", @"iPhone17,3",
        @"iPhone17,4"
      ],
      @62.0 : @[ @"iPhone17,1", @"iPhone17,2", @"iPhone18,1", @"iPhone18,2", @"iPhone18,3", @"iPhone18,4" ],
      @18.0 : @[
        @"iPad8,1",   @"iPad8,2",   @"iPad8,3",   @"iPad8,4",   @"iPad8,5",   @"iPad8,6",   @"iPad8,7",
        @"iPad8,8",   @"iPad8,9",   @"iPad8,10",  @"iPad8,11",  @"iPad8,12",  @"iPad13,1",  @"iPad13,2",
        @"iPad13,4",  @"iPad13,5",  @"iPad13,6",  @"iPad13,7",  @"iPad13,8",  @"iPad13,9",  @"iPad13,10",
        @"iPad13,11", @"iPad13,16", @"iPad13,17", @"iPad14,3",  @"iPad14,4",  @"iPad14,5",  @"iPad14,6",
        @"iPad14,8",  @"iPad14,9",  @"iPad14,10", @"iPad14,11", @"iPad15,3",  @"iPad15,4",  @"iPad15,5",
        @"iPad15,6",  @"iPad16,3",  @"iPad16,4",  @"iPad16,5",  @"iPad16,6"
      ],
    };

    NSMutableDictionary<NSString *, NSNumber *> *byModel = [NSMutableDictionary dictionary];
    [modelsByRadius enumerateKeysAndObjectsUsingBlock:^(NSNumber *radius, NSArray<NSString *> *models, BOOL *stop) {
      for (NSString *model in models) {
        byModel[model] = radius;
      }
    }];
    table = [byModel copy];
  });
  return table;
}

@implementation MorphletDisplayCorners

+ (CGFloat)radiusForModelIdentifier:(NSString *)identifier {
  return MorphletCornerRadiusByModel()[identifier].doubleValue;
}

+ (CGFloat)radiusForWindow:(nullable UIWindow *)window {
  NSString *identifier = [MorphletDeviceModel identifier];
  NSNumber *known = MorphletCornerRadiusByModel()[identifier];
  if (known) {
    return known.doubleValue;
  }

  BOOL hasRoundedDisplay = window.safeAreaInsets.bottom > 0;
  if (!hasRoundedDisplay) {
    return 0;
  }
  return [identifier hasPrefix:@"iPad"] ? kPadCornerRadius : kLatestPhoneCornerRadius;
}

@end
