//
//  MorphletViewController+Stack.h
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletSpringConfig.h"
#import "MorphletViewController.h"

NS_ASSUME_NONNULL_BEGIN

@interface MorphletViewController (Stack)

- (void)pushPresenterStack:(UIViewController *)presenter spring:(MorphletSpringConfig *)spring;

- (void)restorePresenterStackWithSpring:(MorphletSpringConfig *)spring;

@end

NS_ASSUME_NONNULL_END
