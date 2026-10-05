//
//  MorphletSpring.h
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import <UIKit/UIKit.h>
#import "MorphletSpringConfig.h"

NS_ASSUME_NONNULL_BEGIN

@interface MorphletSpring : NSObject

+ (UIViewPropertyAnimator *)animatorWithSpring:(MorphletSpringConfig *)spring velocity:(CGFloat)velocity;

+ (UIViewPropertyAnimator *)animateWithSpring:(MorphletSpringConfig *)spring
                                     velocity:(CGFloat)velocity
                                   animations:(void (^)(void))animations
                                   completion:(nullable void (^)(BOOL finished))completion;

@end

NS_ASSUME_NONNULL_END
