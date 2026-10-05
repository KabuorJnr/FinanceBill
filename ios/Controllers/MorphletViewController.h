//
//  MorphletViewController.h
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import <UIKit/UIKit.h>
#import "MorphletPresentationState.h"
#import "MorphletSpringConfig.h"
#import "MorphletViewControllerDelegate.h"

NS_ASSUME_NONNULL_BEGIN

@interface MorphletViewController : UIViewController

@property (nonatomic, weak, nullable) id<MorphletViewControllerDelegate> delegate;

@property (nonatomic, strong, nullable) UIView *contentView;

@property (nonatomic, strong, nullable) UIColor *cardColor;
@property (nonatomic, strong, nullable) UIColor *backdropColor;
@property (nonatomic, assign) CGFloat cornerRadius;
@property (nonatomic, assign) CGFloat cornerSmoothing;
@property (nonatomic, assign) CGFloat bottomOffset;
@property (nonatomic, assign) CGFloat backdropOpacity;
@property (nonatomic, assign) BOOL dismissible;
@property (nonatomic, assign) BOOL draggable;
@property (nonatomic, assign) BOOL fadesOnDrag;

@property (nonatomic, assign) BOOL fullScreen;

@property (nonatomic, weak, nullable) UIView *originView;

@property (nonatomic, assign) BOOL stacked;

@property (nonatomic, strong, null_resettable) MorphletSpringConfig *presentSpring;
@property (nonatomic, strong, null_resettable) MorphletSpringConfig *dismissSpring;
@property (nonatomic, strong, null_resettable) MorphletSpringConfig *morphSpring;
@property (nonatomic, strong, null_resettable) MorphletSpringConfig *snapSpring;

@property (nonatomic, readonly) MorphletPresentationState presentationState;
@property (nonatomic, readonly) CGFloat keyboardHeight;

- (void)presentFromViewController:(UIViewController *)presenter;

- (void)dismissAnimated:(BOOL)animated;

- (void)contentSizeDidChangeAnimated:(BOOL)animated;

@end

NS_ASSUME_NONNULL_END
