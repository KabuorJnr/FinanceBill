//
//  MorphletContainerViewDelegate.h
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import <UIKit/UIKit.h>
#import "MorphletSpringConfig.h"

NS_ASSUME_NONNULL_BEGIN

@protocol MorphletContainerViewDelegate <NSObject>

- (BOOL)containerViewShouldAnimateLayout;

- (MorphletSpringConfig *)containerViewLayoutSpring;

- (void)containerViewLayoutDidChangeAnimated:(BOOL)animated;

@end

NS_ASSUME_NONNULL_END
