//
//  MorphletLayoutAnimator.h
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import <UIKit/UIKit.h>
#import "MorphletSpringConfig.h"

NS_ASSUME_NONNULL_BEGIN

@interface MorphletLayoutAnimator : NSObject

- (instancetype)initWithRootView:(UIView *)rootView;

- (void)capture;

- (void)discard;

- (BOOL)animateWithSpring:(MorphletSpringConfig *)spring alongside:(nullable void (^)(void))alongside;

@end

NS_ASSUME_NONNULL_END
