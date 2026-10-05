//
//  MorphletDeviceModel.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletDeviceModel.h"

#import <sys/utsname.h>

static NSString *const kSimulatorModelIdentifierKey = @"SIMULATOR_MODEL_IDENTIFIER";

@implementation MorphletDeviceModel

+ (NSString *)identifier {
  static NSString *identifier;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    NSString *simulated = NSProcessInfo.processInfo.environment[kSimulatorModelIdentifierKey];
    if (simulated.length > 0) {
      identifier = simulated;
      return;
    }

    struct utsname systemInfo;
    uname(&systemInfo);
    identifier = [NSString stringWithCString:systemInfo.machine encoding:NSUTF8StringEncoding] ?: @"";
  });
  return identifier;
}

@end
