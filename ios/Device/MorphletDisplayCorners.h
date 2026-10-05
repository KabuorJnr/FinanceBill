//
//  MorphletDisplayCorners.h
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface MorphletDisplayCorners : NSObject

+ (CGFloat)radiusForModelIdentifier:(NSString *)identifier;

+ (CGFloat)radiusForWindow:(nullable UIWindow *)window;

@end

NS_ASSUME_NONNULL_END
